# DRISHTI Backend Dockerfile

FROM node:18-alpine

WORKDIR /usr/src/app

# Copy backend package files
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy backend source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Render provides PORT automatically
EXPOSE 5000

# Start backend
CMD ["npm", "start"]
