// Database configuration for DRISHTI
// Uses DATABASE_URL from environment variables (loaded via dotenv)

const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client - the connection is handled by Prisma internally
const prisma = new PrismaClient();

// Test database connection
async function testConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

module.exports = {
  prisma,
  testConnection
};