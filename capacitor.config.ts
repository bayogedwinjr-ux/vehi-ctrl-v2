import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vehictrl.app',
  appName: 'VehiCtrl',
  webDir: 'dist', // This matches Vite's output folder
  server: {
    androidScheme: 'https'
  }
};

export default config;