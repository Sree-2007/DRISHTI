// Simple verification script to check DRISHTI backend setup
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'package.json',
  'prisma/schema.prisma',
  'src/server.js',
  'src/config/db.js',
  'src/config/cloudinary.js',
  'src/routes/auth.js',
  'src/routes/reports.js',
  'src/routes/zones.js',
  'src/routes/signals.js',
  'src/routes/predictions.js',
  'src/routes/dashboard.js',
  'src/services/socketHandler.js',
  'src/utils/jwt.js',
  'src/utils/validation.js',
  'src/prisma.js',
  'Dockerfile'
];

const missingFiles = [];
const baseDir = __dirname;

requiredFiles.forEach(file => {
  const fullPath = path.join(baseDir, file);
  if (!fs.existsSync(fullPath)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length === 0) {
  console.log('✅ All required files are present!');
  console.log('\nDRISHTI Backend Setup Verification:');
  console.log('- Package.json: OK');
  console.log('- Prisma schema: OK');
  console.log('- Server entry point: OK');
  console.log('- Database config: OK');
  console.log('- Cloudinary config: OK');
  console.log('- All route modules: OK');
  console.log('- Socket.io handler: OK');
  console.log('- JWT utils: OK');
  console.log('- Validation utils: OK');
  console.log('- Prisma client: OK');
  console.log('- Dockerfile: OK');
  console.log('\n🚀 Backend is ready for development!');
  console.log('\nNext steps:');
  console.log('1. Install dependencies: npm install');
  console.log('2. Set up .env file with required variables');
  console.log('3. Run prisma migrate: npx prisma migrate dev');
  console.log('4. Start development server: npm run dev');
  console.log('5. Generate test data: node ../camera-simulator.js');
} else {
  console.log('❌ Missing required files:');
  missingFiles.forEach(file => console.log(`  - ${file}`));
  process.exit(1);
}