import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const isProduction = process.env.APP_ENV === 'production';
  const isDevelopment = process.env.APP_ENV === 'development';

  return {
    ...config,
    owner: "qodetech",
    name: isProduction ? 'QodePulse' : 'QodePulse Dev',
    slug: 'qodepulse',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    scheme: 'qodetech',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    plugins: [
      'expo-router',
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: isProduction 
        ? 'com.qode.qodepulse' 
        : 'com.qode.qodepulse.dev',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: isProduction 
        ? 'com.qode.qodepulse' 
        : 'com.qode.qodepulse.dev',
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      environment: "development",
      apiUrl: "https://api-dev.yourdomain.com",
      eas: {
        projectId: "43a13857-c2ca-4359-afc8-5270ab25a56d",
      },
    },
    updates: {
      url: 'https://u.expo.dev/43a13857-c2ca-4359-afc8-5270ab25a56d',
    },
    runtimeVersion: {
      policy: 'sdkVersion'
    }
  };
};