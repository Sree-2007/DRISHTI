# DRISHTI Driver App

A React Native/Expo application for drivers to report and navigate road hazards in the DRISHTI system.

## Features

- View map with current location and nearby hazards
- Report hazards with type, description, photo, and location
- Turn-by-turn navigation to hazards
- User profile and settings
- Authentication via AsyncStorage

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- A physical device or emulator for testing

## Setup Instructions

1. **Clone the repository** (if not already done)

2. **Navigate to the driver-app directory**:
   ```bash
   cd /c/Users/Jaygopal Samanta/drishti/frontend/driver-app
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```
   or
   ```bash
   expo start
   ```

5. **Run the app**:
   - Scan the QR code with the Expo Go app on your iOS or Android device.
   - Or press `a` to run on Android emulator, `i` to run on iOS simulator.

## Configuration

- The app is configured to connect to the DRISHTI backend at `http://localhost:5000/api`.
- If your backend is running on a different URL, update the `API_BASE_URL` in `services/api.js`.

## Project Structure

- `App.js` - Entry point that sets up navigation
- `navigation/` - Navigation configuration
- `screens/` - Screen components (Home, Report Hazard, Navigation, Profile, Settings)
- `services/` - API service configuration
- `assets/` - Static assets (icons, splash screen, etc.)

## Dependencies

- expo
- react-native
- react-native-maps
- @react-navigation/native
- @react-navigation/native-stack
- axios
- expo-location
- expo-image-picker
- @react-native-async-storage/async-storage
- nativewind
- tailwindcss

## Environment Variables

Create a `.env` file in the root of the project if needed (though not currently used).

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser

## Notes

- Ensure the DRISHTI backend is running and accessible from your device/emulator.
- For location services to work on Android, you may need to enable location permissions in the app settings.
- The app uses AsyncStorage for storing user tokens. In a production environment, consider using a more secure storage solution.

## Troubleshooting

- If you encounter issues with dependencies, try deleting `node_modules` and `package-lock.json` then run `npm install` again.
- For Expo-specific issues, refer to the [Expo documentation](https://docs.expo.dev/).