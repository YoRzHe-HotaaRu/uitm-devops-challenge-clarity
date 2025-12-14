import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rentverse.app',
  appName: 'Rentverse by ClaRity',
  webDir: 'out',
  android: {
    allowMixedContent: true,
  },
  server: {
    // For production, load from Vercel deployment
    url: 'https://rentverse-frontend-nine.vercel.app',
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
