import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rentverse.app',
  appName: 'Rentverse',
  webDir: 'out',
  android: {
    allowMixedContent: true,
  },
  server: {
    // For development with live reload, uncomment and set your IP:
    // url: 'http://YOUR_IP:3001',
    // cleartext: true,

    // For production, the app uses bundled static assets
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
    },
  },
};

export default config;
