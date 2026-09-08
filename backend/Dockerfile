FROM node:20-alpine

WORKDIR /usr/src/app

# Prisma requires OpenSSL
RUN apk add --no-cache openssl

# Copy backend dependency files
COPY backend/package.json backend/package-lock.json ./

# Install production dependencies with --legacy-peer-deps to skip peer dependency conflicts
# and --no-audit to skip security audit that may timeout
RUN npm install --omit=dev --legacy-peer-deps --no-audit || npm install --legacy-peer-deps --no-audit

# Copy backend application
COPY backend/ ./

# Verify Prisma schema exists inside the image
RUN test -f /usr/src/app/prisma/schema.prisma

# Generate Prisma Client
RUN npx prisma generate --schema=/usr/src/app/prisma/schema.prisma

EXPOSE 5000

CMD ["npm", "start"]
