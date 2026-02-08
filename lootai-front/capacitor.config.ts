import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.lootai.app',
  appName: 'LootAI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true, // разрешить HTTP запросы к бэку (https://localhost → http://192.168.x.x)
  },
  plugins: {
    FirebaseApp: {
      android: {
        googleServicesFile: 'google-services.json',
      },
      ios: {
        googleServicesFile: 'GoogleService-Info.plist',
      },
    },
  },
}

export default config
