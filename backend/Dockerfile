FROM node:20-alpine

WORKDIR /usr/src/app

# Prisma requires OpenSSL
RUN apk add --no-cache openssl

# Copy backend dependency files
COPY backend/package.json backend/package-lock.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy backend application
COPY backend/ ./

# Verify Prisma schema exists inside the image
RUN test -f /usr/src/app/prisma/schema.prisma

# Generate Prisma Client
RUN npx prisma generate --schema=/usr/src/app/prisma/schema.prisma

EXPOSE 10000

CMD ["npm", "start"]
