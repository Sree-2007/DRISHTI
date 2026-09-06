// Traffic signal routes for DRISHTI
// Handles traffic signal control, adaptive timing, and ambulance mode

const express = require('express');
const router = express.Router();
const { prisma } = require('../prisma');
const { verifyToken } = require('../utils/jwt');

// Helper function to check if user is admin or police
const isAdminOrPolice = (user) => user.role === 'ADMIN' || user.role === 'POLICE';

// @route   GET /api/signals
// @desc    Get all traffic signals (with optional filtering by zoneId or intersectionName)
// @access  Private (Admin/Police see all, others see only their zone's signals)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { zoneId, intersectionName, limit = 50, page = 1 } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Build filter conditions
    const filters = {};

    // Non-admin/non-police users only see signals from their assigned zone
    if (!isAdminOrPolice(req.user)) {
      const userZoneAssignment = await prisma.zoneAssignment.findFirst({
        where: { officerId: userId, status: 'ACTIVE' },
        select: { zoneId: true }
      });

      if (userZoneAssignment) {
        filters.zoneId = userZoneAssignment.zoneId;
      } else {
        // User not assigned to any zone - return empty
        return res.json({ signals: [], total: 0, page: parseInt(page), limit: parseInt(limit) });
      }
    }

    // Apply additional filters
    if (zoneId && !isAdminOrPolice(req.user)) { // Already filtered by zone for non-admin/police
      // Keep the existing zoneId filter
    } else if (zoneId) {
      filters.zoneId = zoneId;
    }
    if (intersectionName) {
      filters.intersectionName = {
        contains: intersectionName,
        mode: 'insensitive'
      };
    }

    // Get total count
    const total = await prisma.trafficSignal.count({ where: filters });

    // Get signals with pagination
    const signals = await prisma.trafficSignal.findMany({
      where: filters,
      include: {
        zone: {
          select: {
            id: true,
            name: true,
            currentStatus: true
          }
        }
      },
      orderBy: { intersectionName: 'asc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    res.json({
      signals,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get signals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/signals/:id
// @desc    Get a specific traffic signal by ID
// @access  Private (User must be assigned to the zone or be admin/police)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Find signal
    const signal = await prisma.trafficSignal.findUnique({
      where: { id },
      include: {
        zone: {
          select: {
            id: true,
            name: true,
            currentStatus: true
          }
        }
      }
    });

    if (!signal) {
      return res.status(404).json({ message: 'Traffic signal not found' });
    }

    // Check authorization: admin/police can see any signal, others must be in the zone
    if (!isAdminOrPolice(req.user)) {
      const userZoneAssignment = await prisma.zoneAssignment.findFirst({
        where: { officerId: userId, zoneId: signal.zoneId, status: 'ACTIVE' }
      });

      if (!userZoneAssignment) {
        return res.status(403).json({ message: 'Not authorized to access this traffic signal' });
      }
    }

    res.json({ signal });
  } catch (error) {
    console.error('Get signal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/signals
// @desc    Create a new traffic signal
// @access  Private (Admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { zoneId, intersectionName, lat, lng, greenTimeSeconds } = req.body;

    // Validate required fields
    if (!zoneId || !intersectionName || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: 'Zone ID, intersection name, latitude, and longitude are required' });
    }

    // Check if zone exists
    const zoneExists = await prisma.zone.findUnique({ where: { id: zoneId } });
    if (!zoneExists) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    // Create traffic signal
    const signal = await prisma.trafficSignal.create({
      data: {
        zoneId,
        intersectionName,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        greenTimeSeconds: greenTimeSeconds ? parseInt(greenTimeSeconds) : 30,
        currentPhase: 'NORTH' // Default starting phase
      }
    });

    res.status(201).json({
      message: 'Traffic signal created successfully',
      signal: {
        id: signal.id,
        zoneId: signal.zoneId,
        intersectionName: signal.intersectionName,
        lat: signal.lat,
        lng: signal.lng,
        currentPhase: signal.currentPhase,
        greenTimeSeconds: signal.greenTimeSeconds,
        createdAt: signal.createdAt
      }
    });
  } catch (error) {
    console.error('Create signal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/signals/:id
// @desc    Update a traffic signal
// @access  Private (Admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const { zoneId, intersectionName, lat, lng, greenTimeSeconds, currentPhase } = req.body;

    // Check if signal exists
    const signalExists = await prisma.trafficSignal.findUnique({ where: { id } });
    if (!signalExists) {
      return res.status(404).json({ message: 'Traffic signal not found' });
    }

    // Check if zone exists (if zoneId is being updated)
    if (zoneId) {
      const zoneExists = await prisma.zone.findUnique({ where: { id: zoneId } });
      if (!zoneExists) {
        return res.status(404).json({ message: 'Zone not found' });
      }
    }

    // Update traffic signal
    const signal = await prisma.trafficSignal.update({
      where: { id },
      data: {
        zoneId: zoneId || signalExists.zoneId,
        intersectionName: intersectionName || signalExists.intersectionName,
        lat: lat !== undefined ? parseFloat(lat) : signalExists.lat,
        lng: lng !== undefined ? parseFloat(lng) : signalExists.lng,
        greenTimeSeconds: greenTimeSeconds !== undefined ? parseInt(greenTimeSeconds) : signalExists.greenTimeSeconds,
        currentPhase: currentPhase || signalExists.currentPhase,
        updatedAt: new Date()
      }
    });

    res.json({
      message: 'Traffic signal updated successfully',
      signal: {
        id: signal.id,
        zoneId: signal.zoneId,
        intersectionName: signal.intersectionName,
        lat: signal.lat,
        lng: signal.lng,
        currentPhase: signal.currentPhase,
        greenTimeSeconds: signal.greenTimeSeconds,
        updatedAt: signal.updatedAt
      }
    });
  } catch (error) {
    console.error('Update signal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/signals/:id
// @desc    Delete a traffic signal
// @access  Private (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;

    // Check if signal exists
    const signalExists = await prisma.trafficSignal.findUnique({ where: { id } });
    if (!signalExists) {
      return res.status(404).json({ message: 'Traffic signal not found' });
    }

    // Delete traffic signal
    await prisma.trafficSignal.delete({ where: { id } });

    res.json({ message: 'Traffic signal deleted successfully' });
  } catch (error) {
    console.error('Delete signal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/signals/:id/phase
// @desc    Manually set traffic signal phase (for testing/override)
// @access  Private (Admin/Police only)
router.patch('/:id/phase', verifyToken, async (req, res) => {
  try {
    // Check if user is admin or police
    if (!isAdminOrPolice(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin or Police only.' });
    }

    const { id } = req.params;
    const { phase } = req.body; // Must be one of: NORTH, SOUTH, EAST, WEST

    // Validate phase
    const validPhases = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
    if (!phase || !validPhases.includes(phase)) {
      return res.status(400).json({ message: 'Invalid phase. Must be NORTH, SOUTH, EAST, or WEST' });
    }

    // Check if signal exists
    const signalExists = await prisma.trafficSignal.findUnique({ where: { id } });
    if (!signalExists) {
      return res.status(404).json({ message: 'Traffic signal not found' });
    }

    // Update signal phase
    const signal = await prisma.trafficSignal.update({
      where: { id },
      data: {
        currentPhase: phase,
        updatedAt: new Date()
      }
    });

    // Emit Socket.io event for real-time updates
    // This would be handled in socketHandler.js

    res.json({
      message: `Traffic signal phase set to ${phase} successfully`,
      signal: {
        id: signal.id,
        currentPhase: signal.currentPhase,
        updatedAt: signal.updatedAt
      }
    });
  } catch (error) {
    console.error('Set signal phase error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/signals/:id/ambulance-mode
// @desc    Enable/disable ambulance mode for a traffic signal
// @access  Private (Admin/Police only)
router.patch('/:id/ambulance-mode', verifyToken, async (req, res) => {
  try {
    // Check if user is admin or police
    if (!isAdminOrPolice(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin or Police only.' });
    }

    const { id } = req.params;
    const { isAmbulanceMode } = req.body; // Boolean

    // Validate isAmbulanceMode
    if (typeof isAmbulanceMode !== 'boolean') {
      return res.status(400).json({ message: 'isAmbulanceMode must be a boolean' });
    }

    // Check if signal exists
    const signalExists = await prisma.trafficSignal.findUnique({ where: { id } });
    if (!signalExists) {
      return res.status(404).json({ message: 'Traffic signal not found' });
    }

    // Update ambulance mode
    const signal = await prisma.trafficSignal.update({
      where: { id },
      data: {
        isAmbulanceMode,
        updatedAt: new Date()
      }
    });

    // Emit Socket.io event for real-time updates
    // This would be handled in socketHandler.js

    res.json({
      message: `Ambulance mode ${isAmbulanceMode ? 'enabled' : 'disabled'} successfully`,
      signal: {
        id: signal.id,
        isAmbulanceMode: signal.isAmbulanceMode,
        updatedAt: signal.updatedAt
      }
    });
  } catch (error) {
    console.error('Set ambulance mode error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/signals/:id/stats
// @desc    Get statistics for a traffic signal (vehicle/bike counts, etc.)
// @access  Private (User must be assigned to the zone or be admin/police)
router.get('/:id/stats', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check if signal exists
    const signalExists = await prisma.trafficSignal.findUnique({ where: { id } });
    if (!signalExists) {
      return res.status(404).json({ message: 'Traffic signal not found' });
    }

    // Check authorization: admin/police can see any signal's stats, others must be in the zone
    if (!isAdminOrPolice(req.user)) {
      const userZoneAssignment = await prisma.zoneAssignment.findFirst({
        where: { officerId: userId, zoneId: signalExists.zoneId, status: 'ACTIVE' }
      });

      if (!userZoneAssignment) {
        return res.status(403).json({ message: 'Not authorized to access this traffic signal' });
      }
    }

    // In a real implementation, this would come from sensors or historical data
    // For now, we'll return the current counts from the database
    res.json({
      signalId: signalExists.id,
      intersectionName: signalExists.intersectionName,
      vehicleCount: signalExists.vehicleCount,
      bikeCount: signalExists.bikeCount,
      currentPhase: signalExists.currentPhase,
      greenTimeSeconds: signalExists.greenTimeSeconds,
      isAmbulanceMode: signalExists.isAmbulanceMode,
      lastUpdated: signalExists.lastUpdated
    });
  } catch (error) {
    console.error('Get signal stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/signals/:id/counts
// @desc    Update vehicle/bike counts for a traffic signal (from sensors)
// @access  Private (Admin/Police only)
router.patch('/:id/counts', verifyToken, async (req, res) => {
  try {
    // Check if user is admin or police
    if (!isAdminOrPolice(req.user)) {
      return res.status(403).json({ message: 'Access denied. Admin or Police only.' });
    }

    const { id } = req.params;
    const { vehicleCount, bikeCount } = req.body;

    // Validate counts
    if (vehicleCount === undefined && bikeCount === undefined) {
      return res.status(400).json({ message: 'At least one of vehicleCount or bikeCount must be provided' });
    }

    // Check if signal exists
    const signalExists = await prisma.trafficSignal.findUnique({ where: { id } });
    if (!signalExists) {
      return res.status(404).json({ message: 'Traffic signal not found' });
    }

    // Update counts
    const signal = await prisma.trafficSignal.update({
      where: { id },
      data: {
        vehicleCount: vehicleCount !== undefined ? parseInt(vehicleCount) : signalExists.vehicleCount,
        bikeCount: bikeCount !== undefined ? parseInt(bikeCount) : signalExists.bikeCount,
        updatedAt: new Date()
      }
    });

    // Emit Socket.io event for real-time updates
    // This would be handled in socketHandler.js

    res.json({
      message: 'Traffic signal counts updated successfully',
      signal: {
        id: signal.id,
        vehicleCount: signal.vehicleCount,
        bikeCount: signal.bikeCount,
        updatedAt: signal.updatedAt
      }
    });
  } catch (error) {
    console.error('Update signal counts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;