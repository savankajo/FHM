import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.savankajo.fhm',
  appName: 'FHM',
  webDir: 'capacitor-web',
  server: {
    url: 'https://fhmapp.netlify.app',
    cleartext: false
  }
};

export default config;
