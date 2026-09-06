# DRISHTI Police Dashboard

A React web application for police dashboard monitoring and control as part of the DRISHTI system.

## Features

- Dashboard Overview with summary statistics and charts
- Zone Management for viewing and managing police zones and officer assignments
- Report Verification Queue for approving/rejecting incoming reports
- Traffic Signal Control with map interface and signal phase controls
- Prediction Monitor for AI-powered hazard predictions
- User Settings for profile, notifications, and system preferences
- Real-time updates via Socket.io
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- DRISHTI backend running on `http://localhost:5000` (or configure proxy in `vite.config.js`)

## Installation

1. Clone the repository
2. Navigate to the frontend/police-dashboard directory:
   ```bash
   cd /c/Users/Jaygopal Samanta/drishti/frontend/police-dashboard
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn
   ```

## Configuration

The application is configured to connect to the DRISHTI backend at `http://localhost:5000` via Vite proxy.
If your backend runs on a different URL, update the proxy settings in `vite.config.js`.

## Available Scripts

In the project directory, you can run:

### `npm dev` or `yarn dev`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
The page will reload when you make changes.

### `npm build` or `yarn build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm preview` or `yarn preview`

Locally preview the production build.

## Project Structure

```
src/
├── components/       # Reusable components
├── pages/            # Page components
├── services/         # API services
├── utils/            # Utility functions
├── styles/           # CSS files
├── assets/           # Static assets
├── App.js            # Main App component with routing
└── index.js          # Entry point
```

## Dependencies

- React 18
- React Router DOM v6
- Recharts for data visualization
- MapLibre GL for mapping
- Socket.IO client for real-time communication
- Axios for HTTP requests
- Tailwind CSS for styling
- Vite as build tool

## Backend API Endpoints (Expected)

The frontend expects the following backend endpoints (adjust in services as needed):

- `GET /api/dashboard/stats` - Dashboard overview statistics
- `GET /api/zones` - Get all zones
- `GET /api/officers` - Get all officers
- `POST /api/zones/:id/assign` - Assign officer to zone
- `GET /api/reports/queue` - Get pending reports
- `POST /api/reports/:id/approve` - Approve report
- `POST /api/reports/:id/reject` - Reject report
- `GET /api/traffic/signals` - Get traffic signals
- `POST /api/traffic/signals/:id/phase` - Change signal phase
- `POST /api/traffic/ambulance-mode` - Toggle ambulance mode
- `GET /api/predictions/active` - Get active predictions
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/settings/notifications` - Get notification settings
- `PUT /api/settings/notifications` - Update notification settings
- `GET /api/settings/system` - Get system settings
- `PUT /api/settings/system` - Update system settings

## Real-time Updates

The application connects to the backend via Socket.io at `/socket.io` for real-time updates on:
- New reports in verification queue
- Traffic signal phase changes
- New hazard predictions
- Officer assignment changes

## License

This project is proprietary and confidential as part of the DRISHTI system.