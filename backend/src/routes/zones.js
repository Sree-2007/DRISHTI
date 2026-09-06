// Zone routes for DRISHTI
// Handles zone creation, retrieval, updates, and police assignments

const express = require('express');
const router = express.Router();
const { prisma } = require('../prisma');
const { verifyToken } = require('../utils/jwt');

// Helper function to check if user is admin
const isAdmin = (user) => user.role === 'ADMIN';

// @route   GET /api/zones
// @desc    Get all zones (with optional filtering by status)
// @access  Private (Admin sees all, Police sees only assigned zone)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Build filter conditions
    const filters = {};

    // Police users only see zones they are assigned to (active assignment)
    if (userRole === 'POLICE') {
      const userZoneAssignment = await prisma.zoneAssignment.findFirst({
        where: { officerId: userId, status: 'ACTIVE' },
        select: { zoneId: true }
      });

      if (userZoneAssignment) {
        filters.id = userZoneAssignment.zoneId;
      } else {
        // Police officer not assigned to any zone - return empty
        return res.json({ zones: [], total: 0 });
      }
    }

    // Apply status filter if provided
    if (status) {
      filters.currentStatus = status.toUpperCase();
    }

    // Get total count
    const total = await prisma.zone.count({ where: filters });

    // Get zones
    const zones = await prisma.zone.findMany({
      where: filters,
      include: {
        assignedOfficer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            assignments: true,
            signals: true,
            reports: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      zones,
      total
    });
  } catch (error) {
    console.error('Get zones error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/zones/:id
// @desc    Get a specific zone by ID
// @access  Private (User must be assigned to the zone or be admin)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Find zone
    const zone = await prisma.zone.findUnique({
      where: { id },
      include: {
        assignedOfficer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        signals: {
          select: {
            id: true,
            intersectionName: true,
            currentPhase: true,
            greenTimeSeconds: true,
            vehicleCount: true,
            bikeCount: true,
            isAmbulanceMode: true
          }
        },
        _count: {
          select: {
            assignments: true,
            reports: true
          }
        }
      }
    });

    if (!zone) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    // Check authorization: admin can see any zone, police must be assigned
    if (userRole !== 'ADMIN') {
      const userZoneAssignment = await prisma.zoneAssignment.findFirst({
        where: { officerId: userId, zoneId: id, status: 'ACTIVE' }
      });

      if (!userZoneAssignment) {
        return res.status(403).json({ message: 'Not authorized to access this zone' });
      }
    }

    res.json({ zone });
  } catch (error) {
    console.error('Get zone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/zones
// @desc    Create a new zone
// @access  Private (Admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { name, boundary, currentStatus } = req.body;

    // Validate required fields
    if (!name || !boundary) {
      return res.status(400).json({ message: 'Name and boundary are required' });
    }

    // Create zone
    const zone = await prisma.zone.create({
      data: {
        name,
        boundary: JSON.parse(boundary), // Expecting GeoJSON string
        currentStatus: currentStatus ? currentStatus.toUpperCase() : 'NORMAL'
      }
    });

    res.status(201).json({
      message: 'Zone created successfully',
      zone: {
        id: zone.id,
        name: zone.name,
        currentStatus: zone.currentStatus,
        createdAt: zone.createdAt
      }
    });
  } catch (error) {
    console.error('Create zone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/zones/:id
// @desc    Update a zone
// @access  Private (Admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const { name, boundary, currentStatus } = req.body;

    // Check if zone exists
    const zoneExists = await prisma.zone.findUnique({ where: { id } });
    if (!zoneExists) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    // Update zone
    const zone = await prisma.zone.update({
      where: { id },
      data: {
        name: name || zoneExists.name,
        boundary: boundary ? JSON.parse(boundary) : zoneExists.boundary,
        currentStatus: currentStatus ? currentStatus.toUpperCase() : zoneExists.currentStatus,
        updatedAt: new Date()
      }
    });

    res.json({
      message: 'Zone updated successfully',
      zone: {
        id: zone.id,
        name: zone.name,
        currentStatus: zone.currentStatus,
        updatedAt: zone.updatedAt
      }
    });
  } catch (error) {
    console.error('Update zone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/zones/:id
// @desc    Delete a zone
// @access  Private (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;

    // Check if zone exists
    const zoneExists = await prisma.zone.findUnique({ where: { id } });
    if (!zoneExists) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    // Check if zone has active assignments or signals
    const activeAssignments = await prisma.zoneAssignment.count({
      where: { zoneId: id, status: 'ACTIVE' }
    });
    const signalsCount = await prisma.trafficSignal.count({ where: { zoneId: id } });

    if (activeAssignments > 0 || signalsCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete zone with active assignments or traffic signals. Please reassign or remove them first.'
      });
    }

    // Delete zone
    await prisma.zone.delete({ where: { id } });

    res.json({ message: 'Zone deleted successfully' });
  } catch (error) {
    console.error('Delete zone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/zones/:id/assign
// @desc    Assign a police officer to a zone
// @access  Private (Admin only)
router.post('/:id/assign', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id: zoneId } = req.params;
    const { officerId } = req.body;

    // Validate required fields
    if (!officerId) {
      return res.status(400).json({ message: 'Officer ID is required' });
    }

    // Check if zone exists
    const zoneExists = await prisma.zone.findUnique({ where: { id: zoneId } });
    if (!zoneExists) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    // Check if officer exists and is police
    const officer = await prisma.user.findUnique({
      where: { id: officerId },
      select: { id: true, role: true }
    });

    if (!officer || officer.role !== 'POLICE') {
      return res.status(400).json({ message: 'Invalid officer ID or officer is not a police user' });
    }

    // Check if officer is already assigned to this zone (active)
    const existingAssignment = await prisma.zoneAssignment.findFirst({
      where: { officerId, zoneId, status: 'ACTIVE' }
    });

    if (existingAssignment) {
      return res.status(400).json({ message: 'Officer is already assigned to this zone' });
    }

    // Create assignment
    const assignment = await prisma.zoneAssignment.create({
      data: {
        officerId,
        zoneId,
        status: 'ACTIVE'
      }
    });

    // Update zone's assignedOfficerId (optional, for quick lookup)
    await prisma.zone.update({
      where: { id: zoneId },
      data: { assignedOfficerId: officerId }
    });

    res.status(201).json({
      message: 'Officer assigned to zone successfully',
      assignment: {
        id: assignment.id,
        officerId: assignment.officerId,
        zoneId: assignment.zoneId,
        assignedAt: assignment.assignedAt,
        status: assignment.status
      }
    });
  } catch (error) {
    console.error('Assign officer to zone error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/zones/:id/assign/:assignmentId
// @desc    Remove a police officer assignment from a zone
// @access  Private (Admin only)
router.delete('/:id/assign/:assignmentId', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id: zoneId, assignmentId } = req.params;

    // Check if assignment exists and belongs to this zone
    const assignment = await prisma.zoneAssignment.findFirst({
      where: { id: assignmentId, zoneId, status: 'ACTIVE' }
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Active assignment not found for this zone' });
    }

    // Update assignment status to COMPLETED
    const updatedAssignment = await prisma.zoneAssignment.update({
      where: { id: assignmentId },
      data: { status: 'COMPLETED' }
    });

    // If this was the currently assigned officer, clear the zone's assignedOfficerId
    const zone = await prisma.zone.findUnique({ where: { id: zoneId } });
    if (zone.assignedOfficerId === assignment.officerId) {
      await prisma.zone.update({
        where: { id: zoneId },
        data: { assignedOfficerId: null }
      });
    }

    res.json({
      message: 'Officer assignment removed successfully',
      assignment: {
        id: updatedAssignment.id,
        officerId: updatedAssignment.officerId,
        zoneId: updatedAssignment.zoneId,
        assignedAt: updatedAssignment.assignedAt,
        status: updatedAssignment.status
      }
    });
  } catch (error) {
    console.error('Remove officer assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/zones/:id/assignments
// @desc    Get all assignments for a zone (historical and active)
// @access  Private (Admin or assigned officer)
router.get('/:id/assignments', verifyToken, async (req, res) => {
  try {
    const { id: zoneId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check if zone exists
    const zoneExists = await prisma.zone.findUnique({ where: { id: zoneId } });
    if (!zoneExists) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    // Check authorization: admin can see any zone's assignments, police must be assigned
    if (userRole !== 'ADMIN') {
      const userZoneAssignment = await prisma.zoneAssignment.findFirst({
        where: { officerId: userId, zoneId, status: 'ACTIVE' }
      });

      if (!userZoneAssignment) {
        return res.status(403).json({ message: 'Not authorized to view assignments for this zone' });
      }
    }

    // Get assignments
    const assignments = await prisma.zoneAssignment.findMany({
      where: { zoneId },
      include: {
        officer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { assignedAt: 'desc' }
    });

    res.json({ assignments });
  } catch (error) {
    console.error('Get zone assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;