import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.technodrive.app',
  appName: 'TechnoDrive',
  webDir: 'dist', // This matches Vite's output folder
  server: {
    androidScheme: 'http',
    cleartext: true
  }
};

export default config;