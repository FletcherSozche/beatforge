import { CapacitorConfig } from '@capacitor/cli';

const config = {
  appId: 'app.beatforge.studio',
  appName: 'BeatForge',
  webDir: 'dist',
  bundledWebRuntime: false,
  backgroundColor: '#0a0e1a',
  android: {
    allowMixedContent: false,
    backgroundColor: '#0a0e1a',
    webContentsDebuggingEnabled: false,
    minWebViewVersion: 88,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      releaseType: 'AAB'
    }
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0a0e1a',
    scheme: 'BeatForge',
    preferredContentMode: 'mobile',
    limitsNavigationsToAppBoundDomains: true
  },
  server: {
    androidScheme: 'https',
    iosScheme: 'beatforge',
    cleartext: false
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0a0e1a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0e1a',
      overlaysWebView: false
    },
    Haptics: {},
    Preferences: {
      group: 'BeatForgeData'
    },
    Filesystem: {
      iosScheme: 'beatforge'
    }
  }
};

export default config;
