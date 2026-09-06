// Dashboard routes for DRISHTI
// Provides statistics, analytics, and overview data for the system

const express = require('express');
const router = express.Router();
const { prisma } = require('../prisma');
const { verifyToken } = require('../utils/jwt');
const { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } = require('date-fns');

// Helper function to check if user is admin
const isAdmin = (user) => user.role === 'ADMIN';

// @route   GET /api/dashboard/stats
// @desc    Get overall system statistics
// @access  Private (Admin only)
router.get('/stats', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Get counts for various entities
    const [
      totalUsers,
      totalZones,
      totalReports,
      verifiedReports,
      pendingReports,
      rejectedReports,
      totalSignals,
      ambulanceModeSignals
    ] = await Promise.all([
      prisma.user.count(),
      prisma.zone.count(),
      prisma.report.count(),
      prisma.report.count({ where: { status: 'VERIFIED' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.report.count({ where: { status: 'REJECTED' } }),
      prisma.trafficSignal.count(),
      prisma.trafficSignal.count({ where: { isAmbulanceMode: true } })
    ]);

    // Get today's reports
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const todaysReports = await prisma.report.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    // Get reports by type
    const reportsByType = await prisma.report.groupBy({
      by: ['type'],
      _count: true
    });

    // Get zone status distribution
    const zoneStatusDistribution = await prisma.zone.groupBy({
      by: ['currentStatus'],
      _count: true
    });

    res.json({
      users: totalUsers,
      zones: totalZones,
      reports: {
        total: totalReports,
        verified: verifiedReports,
        pending: pendingReports,
        rejected: rejectedReports,
        today: todaysReports
      },
      signals: {
        total: totalSignals,
        inAmbulanceMode: ambulanceModeSignals
      },
      reportsByType: Object.fromEntries(reportsByType.map(item => [item.type, item._count])),
      zoneStatusDistribution: Object.fromEntries(zoneStatusDistribution.map(item => [item.currentStatus, item._count]))
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/reports-trend
// @desc    Get reports trend over time (daily for last 7 days)
// @access  Private (Admin only)
router.get('/reports-trend', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Get reports for the last 7 days
    const sevenDaysAgo = startOfDay(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const now = endOfDay(new Date());

    const reports = await prisma.report.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
          lte: now
        }
      },
      select: {
        createdAt: true,
        type: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by day and type
    const trendData = {};
    const days = [];

    // Initialize last 7 days
    for (let i = 0; i < 7; i++) {
      const date = startOfDay(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
      const dateString = date.toISOString().split('T')[0];
      days.unshift(dateString);
      trendData[dateString] = {
        WATERLOGGING: 0,
        BLOCKAGE: 0,
        RALLY: 0,
        ACCIDENT: 0
      };
    }

    // Populate data
    reports.forEach(report => {
      const dateString = report.createdAt.toISOString().split('T')[0];
      if (trendData[dateString]) {
        trendData[dateString][report.type] += 1;
      }
    });

    // Format for charting libraries
    const labels = days;
    const datasets = [
      {
        label: 'Waterlogging',
        data: days.map(day => trendData[day].WATERLOGGING),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Blockage',
        data: days.map(day => trendData[day].BLOCKAGE),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      },
      {
        label: 'Rally',
        data: days.map(day => trendData[day].RALLY),
        backgroundColor: 'rgba(255, 206, 86, 0.5)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1
      },
      {
        label: 'Accident',
        data: days.map(day => trendData[day].ACCIDENT),
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      }
    ];

    res.json({
      labels,
      datasets
    });
  } catch (error) {
    console.error('Get reports trend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/zone-analytics
// @desc    Get analytics per zone (report counts, status distribution)
// @access  Private (Admin only)
router.get('/zone-analytics', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Get zones with report counts and status distribution
    const zones = await prisma.zone.findMany({
      select: {
        id: true,
        name: true,
        currentStatus: true,
        _count: {
          select: {
            reports: true,
            assignments: true,
            signals: true
          }
        },
        reports: {
          select: {
            status: true,
            type: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Latest 5 reports per zone
        }
      },
      orderBy: { name: 'asc' }
    });

    // Format the data
    const zoneAnalytics = zones.map(zone => {
      // Count reports by status
      const reportsByStatus = zone.reports.reduce((acc, report) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
      }, {});

      // Count reports by type
      const reportsByType = zone.reports.reduce((acc, report) => {
        acc[report.type] = (acc[report.type] || 0) + 1;
        return acc;
      }, {});

      return {
        id: zone.id,
        name: zone.name,
        currentStatus: zone.currentStatus,
        reportCounts: {
          total: zone._count.reports,
          pending: reportsByStatus.PENDING || 0,
          verified: reportsByStatus.VERIFIED || 0,
          rejected: reportsByStatus.REJECTED || 0
        },
        reportTypeDistribution: reportsByType,
        assignmentCount: zone._count.assignments,
        signalCount: zone._count.signals,
        recentReports: zone.reports.map(report => ({
          id: report.id,
          type: report.type,
          status: report.status,
          createdAt: report.createdAt
        }))
      };
    });

    res.json({ zones: zoneAnalytics });
  } catch (error) {
    console.error('Get zone analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/user-leaders
// @desc    Get top users by trust score (for leaderboard)
// @access  Private (Admin only)
router.get('/user-leaders', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { limit = 10 } = req.query;

    // Get top users by trust score
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        trustScore: true,
        _count: {
          select: {
            reports: true
          }
        }
      },
      orderBy: {
        trustScore: 'desc'
      },
      take: parseInt(limit)
    });

    res.json({ leaders: topUsers });
  } catch (error) {
    console.error('Get user leaders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/activity-log
// @desc    Get recent system activity (reports, verifications, etc.)
// @access  Private (Admin only)
router.get('/activity-log', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { limit = 50 } = req.query;

    // Get recent reports with reporter info
    const recentReports = await prisma.report.findMany({
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        reporter: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit)
    });

    // Get recent verifications (reports that were verified/rejected recently)
    const recentVerifications = await prisma.report.findMany({
      where: {
        OR: [
          { status: 'VERIFIED' },
          { status: 'REJECTED' }
        ],
        verifiedByOfficerId: {
          not: null
        }
      },
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        verifiedByOfficer: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: parseInt(limit)
    });

    // Combine and sort by date
    const activity = [
      ...recentReports.map(report => ({
        type: 'REPORT_CREATED',
        description: `New ${report.type} report submitted`,
        timestamp: report.createdAt,
        user: {
          id: report.reporter.id,
          name: report.reporter.name
        }
      })),
      ...recentVerifications.map(report => ({
        type: `REPORT_${report.status}`,
        description: `Report ${report.status.toLowerCase()} by officer`,
        timestamp: report.updatedAt || report.createdAt,
        user: {
          id: report.verifiedByOfficer.id,
          name: report.verifiedByOfficer.name
        }
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit to requested amount
    const limitedActivity = activity.slice(0, parseInt(limit));

    res.json({ activity: limitedActivity });
  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;