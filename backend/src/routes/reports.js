// Report routes for DRISHTI
// Handles creation, retrieval, verification, and nearby queries for reports

const express = require('express');
const router = express.Router();
const { prisma } = require('../prisma');
const { verifyToken } = require('../utils/jwt');
const { uploadFile } = require('../config/cloudinary');
const { startOfDay, endOfDay } = require('date-fns');

// @route   POST /api/reports
// @desc    Create a new report (requires photo upload to Cloudinary)
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  try {
    const { type, description, lat, lng } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!type || !description || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Handle image upload if provided
    let imageUrl = null;
    if (req.files && req.files.image) {
      const result = await uploadFile(req.files.image.tempFilePath);
      imageUrl = result.secure_url;
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        type: type.toUpperCase(), // Ensure enum format
        description,
        imageUrl,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        status: 'PENDING'
      }
    });

    // Emit Socket.io event for real-time updates
    // This would be handled in socketHandler.js

    res.status(201).json({
      message: 'Report created successfully',
      report: {
        id: report.id,
        type: report.type,
        description: report.description,
        imageUrl: report.imageUrl,
        lat: report.lat,
        lng: report.lng,
        status: report.status,
        createdAt: report.createdAt
      }
    });
  } catch (error) {
    console.error('Report creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports
// @desc    Get reports with optional filtering
// @access  Private (Police only sees their zone)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { zoneId, status, limit = 50, page = 1 } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Build filter conditions
    const filters = {};

    // Police users only see reports from their assigned zone
    if (userRole === 'POLICE') {
      const userZoneAssignment = await prisma.zoneAssignment.findFirst({
        where: { officerId: userId, status: 'ACTIVE' },
        include: { zone: true }
      });

      if (userZoneAssignment) {
        filters.zoneId = userZoneAssignment.zoneId;
      } else {
        // Police officer not assigned to any zone - return empty
        return res.json({ reports: [], total: 0, page: parseInt(page), limit: parseInt(limit) });
      }
    }

    // Apply additional filters
    if (zoneId && userRole !== 'POLICE') { // Police already filtered by zone
      filters.zoneId = zoneId;
    }
    if (status) {
      filters.status = status.toUpperCase();
    }

    // Get total count
    const total = await prisma.report.count({ where: filters });

    // Get reports with pagination
    const reports = await prisma.report.findMany({
      where: filters,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            trustScore: true
          }
        },
        zone: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    res.json({
      reports,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/reports/:id/verify
// @desc    Police verifies or rejects a report
// @access  Private (Police only)
router.patch('/:id/verify', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, aiConfidence } = req.body; // status: VERIFIED or REJECTED
    const userId = req.user.userId;

    // Validate status
    if (!status || !['VERIFIED', 'REJECTED'].includes(status.toUpperCase())) {
      return res.status(400).json({ message: 'Invalid status. Must be VERIFIED or REJECTED' });
    }

    // Find report
    const report = await prisma.report.findUnique({
      where: { id },
      include { reporter: true, zone: true }
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user is authorized (police officer in the same zone or admin)
    const userZoneAssignment = await prisma.zoneAssignment.findFirst({
      where: { officerId: userId, zoneId: report.zoneId, status: 'ACTIVE' }
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!userZoneAssignment && user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to verify this report' });
    }

    // Calculate trust score update
    let trustScoreChange = 0;
    if (status.toUpperCase() === 'VERIFIED') {
      trustScoreChange = 10; // +10 for verified report
    } else {
      trustScoreChange = -15; // -15 for rejected report
    }

    // Update report
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status: status.toUpperCase(),
        aiConfidence: aiConfidence ? parseFloat(aiConfidence) : null,
        verifiedByOfficerId: userId
      }
    });

    // Update reporter's trust score
    const reporter = await prisma.user.findUnique({
      where: { id: report.reporterId }
    });

    if (reporter) {
      const newTrustScore = Math.max(0, Math.min(100, reporter.trustScore + trustScoreChange));
      await prisma.user.update({
        where: { id: reporter.id },
        data: { trustScore: newTrustScore }
      });
    }

    // Emit Socket.io event for real-time updates
    // This would be handled in socketHandler.js

    res.json({
      message: `Report ${status.toLowerCase()} successfully`,
      report: {
        id: updatedReport.id,
        status: updatedReport.status,
        trustScoreChange: trustScoreChange,
        verifiedBy: {
          id: userId,
          name: user.name
        }
      }
    });
  } catch (error) {
    console.error('Report verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/nearby
// @desc    Get reports near a location (for driver app hazard layer)
// @access  Private
router.get('/nearby', verifyToken, async (req, res) => {
  try {
    const { lat, lng, radius = 500 } = req.query; // radius in meters, default 500m
    const userId = req.user.userId;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInDegrees = radius / 111000; // Rough conversion: 1 degree ≈ 111km

    // Simple bounding box approach for proximity search
    // For production, consider using PostGIS or similar spatial extension
    const reports = await prisma.report.findMany({
      where: {
        lat: {
          gte: latitude - radiusInDegrees,
          lte: latitude + radiusInDegrees
        },
        lng: {
          gte: longitude - radiusInDegrees,
          lte: longitude + radiusInDegrees
        },
        status: 'VERIFIED' // Only show verified reports to drivers/citizens
      },
      select: {
        id: true,
        type: true,
        description: true,
        imageUrl: true,
        lat: true,
        lng: true,
        createdAt: true,
        reporter: {
          select: {
            id: true,
            name: true,
            trustScore: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit results
    });

    res.json({ reports });
  } catch (error) {
    console.error('Get nearby reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;