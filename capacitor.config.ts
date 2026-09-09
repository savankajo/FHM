/// <reference types="@capacitor/push-notifications" />
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.savankajo.fhm',
  appName: 'FHM',
  webDir: 'capacitor-web',
  backgroundColor: '#0A0A0AFF',
  server: {
    url: 'https://fhmapp.netlify.app',
    cleartext: false,
    errorPath: 'index.html',
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'banner', 'list'],
    },
  },
};

export default config;
