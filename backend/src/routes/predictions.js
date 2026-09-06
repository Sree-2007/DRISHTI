// Prediction routes for DRISHTI
// Handles hazard prediction creation, retrieval, and management

const express = require('express');
const router = express.Router();
const { prisma } = require('../prisma');
const { verifyToken } = require('../utils/jwt');

// Helper function to check if user is admin or police
const isAdminOrPolice = (user) => user.role === 'ADMIN' || user.role === 'POLICE';

// @route   GET /api/predictions
// @desc    Get all hazard predictions (with optional filtering by zoneId, type, or expiry)
// @access  Private (Admin/Police see all, others see only their zone's predictions)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { zoneId, predictedType, activeOnly = true, limit = 50, page = 1 } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Build filter conditions
    const filters = {};

    // Non-admin/non-police users only see predictions from their assigned zone
    if (!isAdminOrPolice(req.user)) {
      const userZoneAssignment = await prisma.zoneAssignment.findFirst({
        where: { officerId: userId, status: 'ACTIVE' },
        select: { zoneId: true }
      });

      if (userZoneAssignment) {
        filters.zoneId = userZoneAssignment.zoneId;
      } else {
        // User not assigned to any zone - return empty
        return res.json({ predictions: [], total: 0, page: parseInt(page), limit: parseInt(limit) });
      }
    }

    // Apply additional filters
    if (zoneId && !isAdminOrPolice(req.user)) { // Already filtered by zone for non-admin/police
      // Keep the existing zoneId filter
    } else if (zoneId) {
      filters.zoneId = zoneId;
    }
    if (predictedType) {
      filters.predictedType = predictedType.toUpperCase();
    }
    if (activeOnly) {
      filters.expiresAt = { gt: new Date() }; // Only show predictions that haven't expired
    }

    // Get total count
    const total = await prisma.hazardPrediction.count({ where: filters });

    // Get predictions with pagination
    const predictions = await prisma.hazardPrediction.findMany({
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
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit)
    });

    res.json({
      predictions,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get predictions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/predictions/:id
// @desc    Get a specific hazard prediction by ID
// @access  Private (User must be assigned to the zone or be admin/police)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Find prediction
    const prediction = await prisma.hazardPrediction.findUnique({
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

    if (!prediction) {
      return res.status(404).json({ message: 'Hazard prediction not found' });
    }

    // Check authorization: admin/police can see any prediction, others must be in the zone
    if (!isAdminOrPolice(req.user)) {
      const userZoneAssignment = await prisma.zoneAssignment.findFirst({
        where: { officerId: userId, zoneId: prediction.zoneId, status: 'ACTIVE' }
      });

      if (!userZoneAssignment) {
        return res.status(403).json({ message: 'Not authorized to access this hazard prediction' });
      }
    }

    res.json({ prediction });
  } catch (error) {
    console.error('Get prediction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/predictions
// @desc    Create a new hazard prediction
// @access  Private (Admin only)
router.post('/', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { zoneId, predictedType, confidenceScore, weatherData, expiresAt } = req.body;

    // Validate required fields
    if (!zoneId || !predictedType || confidenceScore === undefined || !expiresAt) {
      return res.status(400).json({ message: 'Zone ID, predicted type, confidence score, and expiry time are required' });
    }

    // Check if zone exists
    const zoneExists = await prisma.zone.findUnique({ where: { id: zoneId } });
    if (!zoneExists) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    // Validate confidence score
    const score = parseFloat(confidenceScore);
    if (isNaN(score) || score < 0 || score > 100) {
      return res.status(400).json({ message: 'Confidence score must be between 0 and 100' });
    }

    // Create hazard prediction
    const prediction = await prisma.hazardPrediction.create({
      data: {
        zoneId,
        predictedType: predictedType.toUpperCase(),
        confidenceScore: score,
        weatherData: weatherData ? JSON.parse(weatherData) : {},
        expiresAt: new Date(expiresAt)
      }
    });

    res.status(201).json({
      message: 'Hazard prediction created successfully',
      prediction: {
        id: prediction.id,
        zoneId: prediction.zoneId,
        predictedType: prediction.predictedType,
        confidenceScore: prediction.confidenceScore,
        weatherData: prediction.weatherData,
        expiresAt: prediction.expiresAt,
        createdAt: prediction.createdAt
      }
    });
  } catch (error) {
    console.error('Create prediction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/predictions/:id
// @desc    Update a hazard prediction
// @access  Private (Admin only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const { zoneId, predictedType, confidenceScore, weatherData, expiresAt } = req.body;

    // Check if prediction exists
    const predictionExists = await prisma.hazardPrediction.findUnique({ where: { id } });
    if (!predictionExists) {
      return res.status(404).json({ message: 'Hazard prediction not found' });
    }

    // Check if zone exists (if zoneId is being updated)
    if (zoneId) {
      const zoneExists = await prisma.zone.findUnique({ where: { id: zoneId } });
      if (!zoneExists) {
        return res.status(404).json({ message: 'Zone not found' });
      }
    }

    // Validate confidence score if provided
    if (confidenceScore !== undefined) {
      const score = parseFloat(confidenceScore);
      if (isNaN(score) || score < 0 || score > 100) {
        return res.status(400).json({ message: 'Confidence score must be between 0 and 100' });
      }
    }

    // Update hazard prediction
    const prediction = await prisma.hazardPrediction.update({
      where: { id },
      data: {
        zoneId: zoneId || predictionExists.zoneId,
        predictedType: predictedType ? predictedType.toUpperCase() : predictionExists.predictedType,
        confidenceScore: confidenceScore !== undefined ? parseFloat(confidenceScore) : predictionExists.confidenceScore,
        weatherData: weatherData ? JSON.parse(weatherData) : predictionExists.weatherData,
        expiresAt: expiresAt ? new Date(expiresAt) : predictionExists.expiresAt
      }
    });

    res.json({
      message: 'Hazard prediction updated successfully',
      prediction: {
        id: prediction.id,
        zoneId: prediction.zoneId,
        predictedType: prediction.predictedType,
        confidenceScore: prediction.confidenceScore,
        weatherData: prediction.weatherData,
        expiresAt: prediction.expiresAt,
        updatedAt: prediction.updatedAt
      }
    });
  } catch (error) {
    console.error('Update prediction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/predictions/:id
// @desc    Delete a hazard prediction
// @access  Private (Admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;

    // Check if prediction exists
    const predictionExists = await prisma.hazardPrediction.findUnique({ where: { id } });
    if (!predictionExists) {
      return res.status(404).json({ message: 'Hazard prediction not found' });
    }

    // Delete hazard prediction
    await prisma.hazardPrediction.delete({ where: { id } });

    res.json({ message: 'Hazard prediction deleted successfully' });
  } catch (error) {
    console.error('Delete prediction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/predictions/zone/:zoneId
// @desc    Get active predictions for a specific zone
// @access  Private (User must be assigned to the zone or be admin/police)
router.get('/zone/:zoneId', verifyToken, async (req, res) => {
  try {
    const { zoneId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check if zone exists
    const zoneExists = await prisma.zone.findUnique({ where: { id: zoneId } });
    if (!zoneExists) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    // Check authorization: admin/police can see any zone's predictions, others must be assigned
    if (!isAdminOrPolice(req.user)) {
      const userZoneAssignment = await prisma.zoneAssignment.findFirst({
        where: { officerId: userId, zoneId, status: 'ACTIVE' }
      });

      if (!userZoneAssignment) {
        return res.status(403).json({ message: 'Not authorized to view predictions for this zone' });
      }
    }

    // Get active predictions for the zone
    const predictions = await prisma.hazardPrediction.findMany({
      where: {
        zoneId,
        expiresAt: { gt: new Date() } // Only active predictions
      },
      include: {
        zone: {
          select: {
            id: true,
            name: true,
            currentStatus: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ predictions });
  } catch (error) {
    console.error('Get zone predictions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/predictions/simulate
// @desc    Simulate a hazard prediction (for testing/demo purposes)
// @access  Private (Admin only)
router.post('/simulate', verifyToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { zoneId } = req.body;

    // Validate required fields
    if (!zoneId) {
      return res.status(400).json({ message: 'Zone ID is required' });
    }

    // Check if zone exists
    const zoneExists = await prisma.zone.findUnique({ where: { id: zoneId } });
    if (!zoneExists) {
      return res.status(404).json({ message: 'Zone not found' });
    }

    // Prediction types
    const predictionTypes = ['WATERLOGGING', 'BLOCKAGE', 'RALLY', 'ACCIDENT'];
    const predictedType = predictionTypes[Math.floor(Math.random() * predictionTypes.length)];

    // Random confidence score between 60 and 95
    const confidenceScore = Math.floor(Math.random() * 36) + 60;

    // Mock weather data
    const weatherData = {
      temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
      humidity: Math.floor(Math.random() * 40) + 40,    // 40-80%
      pressure: Math.floor(Math.random() * 30) + 990,   // 990-1020 hPa
      description: ['clear sky', 'few clouds', 'scattered clouds', 'broken clouds', 'shower rain', 'rain', 'thunderstorm'][Math.floor(Math.random() * 7)]
    };

    // Expires in 1 to 6 hours
    const expiresAt = new Date(Date.now() + Math.floor(Math.random() * 21600000) + 3600000); // 1-6 hours in ms

    // Create hazard prediction
    const prediction = await prisma.hazardPrediction.create({
      data: {
        zoneId,
        predictedType,
        confidenceScore,
        weatherData,
        expiresAt
      }
    });

    res.status(201).json({
      message: 'Simulated hazard prediction created successfully',
      prediction: {
        id: prediction.id,
        zoneId: prediction.zoneId,
        predictedType: prediction.predictedType,
        confidenceScore: prediction.confidenceScore,
        weatherData: prediction.weatherData,
        expiresAt: prediction.expiresAt,
        createdAt: prediction.createdAt
      }
    });
  } catch (error) {
    console.error('Simulate prediction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;