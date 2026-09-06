# DRISHTI Citizen App

A React Native/Expo mobile application for citizens to report hazards and contribute to community safety.

## Features

- **Home Feed**: View recent hazard reports from the community
- **Report Hazard**: Submit new hazard reports with photos, descriptions, and location
- **Profile & Trust Score**: View user information, trust score, and statistics
- **Leaderboard**: See top contributors by trust score
- **Notifications**: Receive updates on report verifications and community activity
- **Authentication**: Secure login and session management

## Prerequisites

- Node.js (>= 14)
- npm or yarn
- Expo CLI
- Physical device or emulator for testing

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd drishti/frontend/citizen-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root of the project:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your device**
   - Install the Expo Go app on your iOS or Android device
   - Scan the QR code displayed in the terminal or Expo Dev Tools
   - Alternatively, press `a` for Android emulator or `i` for iOS simulator

## Project Structure

```
citizen-app/
├── App.js                 # Entry point with navigation setup
├── screens/               # Screen components
│   ├── HomeScreen.js
│   ├── ReportHazardScreen.js
│   ├── ProfileScreen.js
│   ├── LeaderboardScreen.js
│   └── NotificationsScreen.js
├── services/              # API service configuration
│   └── api.js
├── assets/                # Images, icons, etc.
└── README.md              # This file
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run in web browser

## Backend Connection

The app connects to the DRISHTI backend API running on `localhost:5000` by default. 
To change the API URL, modify the `EXPO_PUBLIC_API_URL` in your `.env` file.

## Dependencies

- `expo` - Expo framework
- `@react-navigation/native` & `@react-navigation/native-stack` - Navigation
- `axios` - HTTP client
- `expo-location` - Location services
- `expo-image-picker` - Image selection/capture
- `react-native-confetti` - Celebration animations
- `@react-native-async-storage/async-storage` - Local storage
- `@expo/vector-icons` - Icon set

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.