FROM node:18-alpine

WORKDIR /usr/src/app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy backend package files
COPY backend/package.json backend/package-lock.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy the complete backend
COPY backend/ ./

# Generate Prisma Client using the exact schema location
RUN npx prisma generate --schema=/usr/src/app/prisma/schema.prisma

# Render provides PORT automatically
EXPOSE 10000

# Start the server
CMD ["npm", "start"]
