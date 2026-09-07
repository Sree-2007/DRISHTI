FROM node:18-alpine

WORKDIR /usr/src/app

# Copy backend dependency files
COPY backend/package.json backend/package-lock.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy backend source
COPY backend/ ./

# Generate Prisma client
RUN npx prisma generate

# Render supplies PORT at runtime
EXPOSE 10000

# Start backend
CMD ["npm", "start"]
