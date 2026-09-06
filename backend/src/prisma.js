// DRISHTI Prisma Client Initialization
// This file initializes and exports the Prisma Client instance for database access

const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
const prisma = new PrismaClient();

// Export the prisma instance
module.exports = prisma;