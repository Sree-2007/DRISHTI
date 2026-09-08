// Socket.IO handler for DRISHTI
// Manages real-time communication between clients and server

const prisma = require('../prisma');  // ✓ Fixed import
const { verifyToken } = require('../utils/jwt');

// Store connected users by socket ID
const connectedUsers = new Map();

// Initialize Socket.IO with event handlers
function initialize(io) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user authentication
    socket.on('authenticate', async (token) => {
      try {
        // Verify the JWT token
        const decoded = verifyToken(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId) {
          return socket.emit('authenticated', { success: false, message: 'Invalid token' });
        }

        const userId = decoded.userId;

        // Store user info with socket
        connectedUsers.set(socket.id, { userId, socket });

        // Join user-specific room for private notifications
        socket.join(`user_${userId}`);

        console.log(`User ${userId} authenticated with socket ${socket.id}`);

        // Send confirmation
        socket.emit('authenticated', { success: true });
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('authenticated', { success: false, message: 'Invalid token' });
      }
    });

    // Handle joining a zone room (for zone-specific updates)
    socket.on('joinZone', async (zoneId) => {
      try {
        const userData = connectedUsers.get(socket.id);
        if (!userData) {
          return socket.emit('error', { message: 'Not authenticated' });
        }

        // Join zone room
        socket.join(`zone_${zoneId}`);
        console.log(`Socket ${socket.id} joined zone ${zoneId}`);

        // Confirm joining
        socket.emit('zoneJoined', { zoneId, success: true });
      } catch (error) {
        console.error('Join zone error:', error);
        socket.emit('error', { message: 'Failed to join zone' });
      }
    });

    // Handle leaving a zone room
    socket.on('leaveZone', async (zoneId) => {
      try {
        const userData = connectedUsers.get(socket.id);
        if (!userData) {
          return socket.emit('error', { message: 'Not authenticated' });
        }

        // Leave zone room
        socket.leave(`zone_${zoneId}`);
        console.log(`Socket ${socket.id} left zone ${zoneId}`);

        // Confirm leaving
        socket.emit('zoneLeft', { zoneId, success: true });
      } catch (error) {
        console.error('Leave zone error:', error);
        socket.emit('error', { message: 'Failed to leave zone' });
      }
    });

    // Handle new report creation (from client)
    socket.on('createReport', async (reportData) => {
      try {
        const userData = connectedUsers.get(socket.id);
        if (!userData) {
          return socket.emit('error', { message: 'Not authenticated' });
        }

        const { type, description, lat, lng, imageUrl } = reportData;
        const userId = userData.userId;

        // Validate required fields
        if (!type || !description || lat === undefined || lng === undefined) {
          return socket.emit('error', { message: 'Missing required fields' });
        }

        // Create report in database
        const report = await prisma.report.create({
          data: {
            reporterId: userId,
            type: type.toUpperCase(),
            description,
            imageUrl,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            status: 'PENDING'
          },
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
          }
        });

        // Emit to zone room for real-time updates
        io.to(`zone_${report.zoneId}`).emit('newReport', {
          report: {
            id: report.id,
            type: report.type,
            description: report.description,
            imageUrl: report.imageUrl,
            lat: report.lat,
            lng: report.lng,
            status: report.status,
            createdAt: report.createdAt,
            reporter: {
              id: report.reporter.id,
              name: report.reporter.name,
              trustScore: report.reporter.trustScore
            },
            zone: {
              id: report.zone.id,
              name: report.zone.name
            }
          }
        });

        // Send confirmation to sender
        socket.emit('reportCreated', {
          success: true,
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

        console.log(`Report created: ${report.id} by user ${userId}`);
      } catch (error) {
        console.error('Create report error:', error);
        socket.emit('error', { message: 'Failed to create report' });
      }
    });

    // Handle report verification (from police)
    socket.on('verifyReport', async (data) => {
      try {
        const userData = connectedUsers.get(socket.id);
        if (!userData) {
          return socket.emit('error', { message: 'Not authenticated' });
        }

        const { reportId, status, aiConfidence } = data;
        const userId = userData.userId;

        // Validate status
        if (!status || !['VERIFIED', 'REJECTED'].includes(status.toUpperCase())) {
          return socket.emit('error', { message: 'Invalid status. Must be VERIFIED or REJECTED' });
        }

        // Find report
        const report = await prisma.report.findUnique({
          where: { id: reportId },
          include: {
            reporter: true,
            zone: true
          }
        });

        if (!report) {
          return socket.emit('error', { message: 'Report not found' });
        }

        // Check if user is authorized (police officer in the same zone or admin)
        const userZoneAssignment = await prisma.zoneAssignment.findFirst({
          where: { officerId: userId, zoneId: report.zoneId, status: 'ACTIVE' }
        });

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!userZoneAssignment && user.role !== 'ADMIN') {
          return socket.emit('error', { message: 'Not authorized to verify this report' });
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
          where: { id: reportId },
          data: {
            status: status.toUpperCase(),
            aiConfidence: aiConfidence ? parseFloat(aiConfidence) : null,
            verifiedByOfficerId: userId
          },
          include: {
            reporter: true,
            zone: true
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

        // Emit to zone room for real-time updates
        io.to(`zone_${report.zoneId}`).emit('reportUpdated', {
          report: {
            id: updatedReport.id,
            status: updatedReport.status,
            trustScoreChange: trustScoreChange,
            verifiedBy: {
              id: userId,
              name: user.name
            },
            reporter: {
              id: report.reporter.id,
              name: report.reporter.name,
              trustScore: newTrustScore
            }
          }
        });

        // Send confirmation to sender
        socket.emit('reportVerified', {
          success: true,
          message: `Report ${status.toLowerCase()} successfully`,
          report: {
            id: updatedReport.id,
            status: updatedReport.status,
            trustScoreChange: trustScoreChange
          }
        });

        console.log(`Report ${reportId} ${status.toLowerCase()} by officer ${userId}`);
      } catch (error) {
        console.error('Verify report error:', error);
        socket.emit('error', { message: 'Failed to verify report' });
      }
    });

    // Handle traffic signal phase update
    socket.on('updateSignalPhase', async (data) => {
      try {
        const userData = connectedUsers.get(socket.id);
        if (!userData) {
          return socket.emit('error', { message: 'Not authenticated' });
        }

        // Check if user is admin or police
        const user = await prisma.user.findUnique({ where: { id: userData.userId } });
        if (user.role !== 'ADMIN' && user.role !== 'POLICE') {
          return socket.emit('error', { message: 'Access denied. Admin or Police only.' });
        }

        const { signalId, phase } = data;

        // Validate phase
        const validPhases = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
        if (!phase || !validPhases.includes(phase)) {
          return socket.emit('error', { message: 'Invalid phase. Must be NORTH, SOUTH, EAST, or WEST' });
        }

        // Check if signal exists
        const signal = await prisma.trafficSignal.findUnique({
          where: { id: signalId },
          include: {
            zone: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        if (!signal) {
          return socket.emit('error', { message: 'Traffic signal not found' });
        }

        // Update signal phase
        const updatedSignal = await prisma.trafficSignal.update({
          where: { id: signalId },
          data: {
            currentPhase: phase,
            updatedAt: new Date()
          },
          include: {
            zone: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        // Emit to zone room for real-time updates
        io.to(`zone_${signal.zoneId}`).emit('signalPhaseUpdated', {
          signal: {
            id: updatedSignal.id,
            currentPhase: updatedSignal.currentPhase,
            updatedAt: updatedSignal.updatedAt
          }
        });

        // Send confirmation to sender
        socket.emit('signalPhaseUpdated', {
          success: true,
          message: `Traffic signal phase set to ${phase} successfully`,
          signal: {
            id: updatedSignal.id,
            currentPhase: updatedSignal.currentPhase,
            updatedAt: updatedSignal.updatedAt
          }
        });

        console.log(`Signal ${signalId} phase updated to ${phase} by user ${user.id}`);
      } catch (error) {
        console.error('Update signal phase error:', error);
        socket.emit('error', { message: 'Failed to update signal phase' });
      }
    });

    // Handle ambulance mode toggle
    socket.on('toggleAmbulanceMode', async (data) => {
      try {
        const userData = connectedUsers.get(socket.id);
        if (!userData) {
          return socket.emit('error', { message: 'Not authenticated' });
        }

        // Check if user is admin or police
        const user = await prisma.user.findUnique({ where: { id: userData.userId } });
        if (user.role !== 'ADMIN' && user.role !== 'POLICE') {
          return socket.emit('error', { message: 'Access denied. Admin or Police only.' });
        }

        const { signalId, isAmbulanceMode } = data;

        // Validate isAmbulanceMode
        if (typeof isAmbulanceMode !== 'boolean') {
          return socket.emit('error', { message: 'isAmbulanceMode must be a boolean' });
        }

        // Check if signal exists
        const signal = await prisma.trafficSignal.findUnique({
          where: { id: signalId },
          include: {
            zone: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        if (!signal) {
          return socket.emit('error', { message: 'Traffic signal not found' });
        }

        // Update ambulance mode
        const updatedSignal = await prisma.trafficSignal.update({
          where: { id: signalId },
          data: {
            isAmbulanceMode,
            updatedAt: new Date()
          },
          include: {
            zone: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });

        // Emit to zone room for real-time updates
        io.to(`zone_${signal.zoneId}`).emit('ambulanceModeToggled', {
          signal: {
            id: updatedSignal.id,
            isAmbulanceMode: updatedSignal.isAmbulanceMode,
            updatedAt: updatedSignal.updatedAt
          }
        });

        // Send confirmation to sender
        socket.emit('ambulanceModeToggled', {
          success: true,
          message: `Ambulance mode ${isAmbulanceMode ? 'enabled' : 'disabled'} successfully`,
          signal: {
            id: updatedSignal.id,
            isAmbulanceMode: updatedSignal.isAmbulanceMode,
            updatedAt: updatedSignal.updatedAt
          }
        });

        console.log(`Signal ${signalId} ambulance mode ${isAmbulanceMode ? 'enabled' : 'disabled'} by user ${user.id}`);
      } catch (error) {
        console.error('Toggle ambulance mode error:', error);
        socket.emit('error', { message: 'Failed to toggle ambulance mode' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      connectedUsers.delete(socket.id);
    });
  });
}

module.exports = { initialize };
