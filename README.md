# DRISHTI - Dynamic Roadway Intelligence System for Hazard Tracking & Intervention

Smart Urban Traffic Management System for SIH 2026 Hackathon

## Overview

DRISHTI is a comprehensive traffic management system that provides real-time hazard detection, reporting, and management capabilities for urban environments. The system consists of:

- **Backend API** (Node.js/Express) with PostgreSQL database
- **Real-time Engine** (Socket.io with Redis adapter)
- **Frontend Applications**:
  - Driver App (React Native/Expo)
  - Citizen App (React Native/Expo)
  - Police Dashboard (React web)
- **Camera Simulator** for generating test data
- **Docker Compose** for easy deployment

## Features

- Real-time hazard reporting with photo evidence
- AI-assisted report verification (mock implementation)
- Trust scoring system for reporters
- Zone-based police assignments
- Traffic signal control with adaptive timing
- Ambulance mode for emergency vehicles
- Hazard prediction engine
- Live dashboard with analytics and statistics
- GPS-based nearby hazard alerts
- Role-based access control (Driver, Citizen, Police, Admin)

## Tech Stack

### Backend
- Node.js 18 + Express.js
- PostgreSQL 15 with Prisma ORM
- Socket.io 4 for real-time communication
- Redis 7 for Socket.io adapter
- JWT authentication (15min access, 7d refresh tokens)
- bcrypt password hashing (salt rounds: 12)
- Cloudinary for image storage
- Zod for input validation
- Helmet.js, CORS, rate limiting for security

### Frontend
- React Native (Expo SDK 52) for mobile apps
- React 18 + Tailwind CSS + Recharts for web dashboard
- MapLibre GL JS (web) / react-native-maps (mobile) for maps
- Firebase Cloud Messaging for push notifications

### DevOps
- Docker + Docker Compose for containerization
- Git for version control

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose
- PostgreSQL client (for manual setup)
- Redis client (for manual setup)
- Expo CLI (for frontend development)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
POSTGRES_USER=drishti
POSTGRES_PASSWORD=drishti123
POSTGRES_DB=drishti
DATABASE_URL=postgresql://drishti:drishti123@localhost:5432/drishti

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production

# Cloudinary (for image storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Redis (for Socket.io adapter)
REDIS_HOST=localhost
REDIS_PORT=6379

# Firebase (for push notifications - optional for development)
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
```

### Installation & Setup

#### Option 1: Using Docker Compose (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd drishti

# Start all services
docker-compose up --build

# The backend API will be available at http://localhost:5000
```

#### Option 2: Manual Setup
```bash
# Clone the repository
git clone <repository-url>
cd drishti

# Backend Setup
cd backend
npm install

# Set up database
npx prisma migrate dev --name init
npx prisma generate

# Start backend
npm run dev

# The backend API will be available at http://localhost:5000

# Frontend Setup (separate terminals for each app)
# Driver App
cd ../frontend/driver-app
npm install
expo start

# Citizen App
cd ../frontend/citizen-app
npm install
expo start

# Police Dashboard
cd ../frontend/police-dashboard
npm install
npm start
```

### Camera Simulator (for test data)
```bash
# From project root
node camera-simulator.js
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

#### Reports
- `POST /api/reports` - Create new report
- `GET /api/reports` - Get reports (with filtering)
- `PATCH /api/reports/:id/verify` - Verify/reject report (Police only)
- `GET /api/reports/nearby` - Get nearby reports

#### Zones
- `GET /api/zones` - Get all zones
- `GET /api/zones/:id` - Get specific zone
- `POST /api/zones` - Create new zone (Admin only)
- `PUT /api/zones/:id` - Update zone (Admin only)
- `DELETE /api/zones/:id` - Delete zone (Admin only)
- `POST /api/zones/:id/assign` - Assign officer to zone (Admin only)
- `DELETE /api/zones/:id/assign/:assignmentId` - Remove assignment (Admin only)
- `GET /api/zones/:id/assignments` - Get zone assignments

#### Traffic Signals
- `GET /api/signals` - Get all traffic signals
- `GET /api/signals/:id` - Get specific signal
- `POST /api/signals` - Create new signal (Admin only)
- `PUT /api/signals/:id` - Update signal (Admin only)
- `DELETE /api/signals/:id` - Delete signal (Admin only)
- `PATCH /api/signals/:id/phase` - Update signal phase (Admin/Police)
- `PATCH /api/signals/:id/ambulance-mode` - Toggle ambulance mode (Admin/Police)
- `GET /api/signals/:id/stats` - Get signal statistics
- `PATCH /api/signals/:id/counts` - Update vehicle/bike counts (Admin/Police)

#### Predictions
- `GET /api/predictions` - Get all hazard predictions
- `GET /api/predictions/:id` - Get specific prediction
- `POST /api/predictions` - Create new prediction (Admin only)
- `PUT /api/predictions/:id` - Update prediction (Admin only)
- `DELETE /api/predictions/:id` - Delete prediction (Admin only)
- `GET /api/predictions/zone/:zoneId` - Get predictions for zone
- `POST /api/predictions/simulate` - Simulate prediction (Admin only)

#### Dashboard
- `GET /api/dashboard/stats` - Get system statistics (Admin only)
- `GET /api/dashboard/reports-trend` - Get reports trend (Admin only)
- `GET /api/dashboard/zone-analytics` - Get zone analytics (Admin only)
- `GET /api/dashboard/user-leaders` - Get user leaderboard (Admin only)
- `GET /api/dashboard/activity-log` - Get activity log (Admin only)

### Demo Credentials

After setting up the database, you can create an admin user:

```bash
# Using Prisma Studio
npx prisma studio

# Or create via API:
POST /api/auth/register
{
  "name": "Admin User",
  "email": "admin@drishti.system",
  "phone": "9999999999",
  "password": "admin123",
  "role": "ADMIN"
}
```

### Testing

Run the camera simulator to generate test data:
```bash
node camera-simulator.js
```

This will create automated reports that you can view in the frontend applications.

### Project Structure

```
drishti/
├── backend/                  # Node.js/Express backend
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── middleware/       # Custom middleware
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # Business logic (Socket.io, etc.)
│   │   ├── utils/            # Utility functions
│   │   └── prisma/           # Prisma client initialization
│   ├── prisma/               # Prisma schema and migrations
│   ├── Dockerfile            # Backend Dockerfile
│   ├── package.json
│   └── server.js             # Entry point
├── frontend/                 # Frontend applications
│   ├── driver-app/           # React Native/Expo Driver App
│   ├── citizen-app/          # React Native/Expo Citizen App
│   └── police-dashboard/     # React Web Police Dashboard
├── camera-simulator.js       # Test data generator
├── docker-compose.yml        # Docker Compose configuration
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## Implementation Status

✅ **Backend Foundation**
- User authentication with JWT and refresh tokens
- Password hashing with bcrypt (12 salt rounds)
- Role-based access control (Driver, Citizen, Police, Admin)
- Input validation with Zod
- Database models with Prisma ORM (UUIDs for all IDs)
- RESTful API structure
- Error handling and middleware (Helmet.js, CORS, rate limiting)

✅ **Core Modules Implemented**
- Report creation, retrieval, and verification
- Zone management and police assignments
- Traffic signal control and ambulance mode
- Hazard prediction system
- Dashboard analytics and statistics
- Socket.io real-time communication
- Cloudinary integration for image uploads

✅ **DevOps & Infrastructure**
- Docker Compose setup with PostgreSQL and Redis
- Backend Dockerfile
- Environment configuration
- Camera simulator for test data

🔲 **Frontend Applications** (To be implemented)
- Driver App (React Native/Expo)
- Citizen App (React Native/Expo)
- Police Dashboard (React web)

## Future Enhancements

1. **AI Integration**: Replace mock AI checks with actual TensorFlow.js model for image classification
2. **Advanced Analytics**: Machine learning models for hazard prediction
3. **Expanded Sensor Integration**: Actual traffic camera and IoT sensor feeds
4. **Multi-language Support**: i18n for diverse user base
5. **Offline Capabilities**: Local caching for poor connectivity areas
6. **Accessibility Features**: WCAG 2.2 compliance for all interfaces
7. **Performance Optimization**: Query optimization and caching strategies
8. **Security Enhancements**: Regular security audits and penetration testing

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Smart India Hackathon 2026 organizers
- Open source community for the various libraries and frameworks used
- Mentors and advisors for guidance and support

---

**DRISHTI v1.0** - Making Indian cities safer and smarter, one report at a time.