# DRISHTI Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').request({host:'localhost', port:5000, path:'/api/health'}, res => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', e => process.exit(1))"

# Start application
CMD ["npm", "run", "start"]