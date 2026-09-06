import { io } from 'socket.io-client';

let socket = null;

// Initialize socket connection
export const initSocket = (token) => {
  if (!socket) {
    socket = io(process.env.VITE_API_BASE_URL || 'http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });
  }

  return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Get socket instance
export const getSocket = () => socket;

// Event listeners
export const onNewReport = (callback) => {
  if (socket) {
    socket.on('new-report', callback);
    return () => {
      socket.off('new-report', callback);
    };
  }
};

export const onSignalUpdate = (callback) => {
  if (socket) {
    socket.on('signal-update', callback);
    return () => {
      socket.off('signal-update', callback);
    };
  }
};

export const onNewPrediction = (callback) => {
  if (socket) {
    socket.on('new-prediction', callback);
    return () => {
      socket.off('new-prediction', callback);
    };
  }
};

export const onOfficerAssignment = (callback) => {
  if (socket) {
    socket.on('officer-assignment', callback);
    return () => {
      socket.off('officer-assignment', callback);
    };
  }
};

// Emit events
export const emitJoinZoneRoom = (zoneId) => {
  if (socket) {
    socket.emit('join-zone-room', { zoneId });
  }
};

export const emitLeaveZoneRoom = (zoneId) => {
  if (socket) {
    socket.emit('leave-zone-room', { zoneId });
  }
};

export default { initSocket, disconnectSocket, getSocket, onNewReport, onSignalUpdate, onNewPrediction, onOfficerAssignment, emitJoinZoneRoom, emitLeaveZoneRoom };