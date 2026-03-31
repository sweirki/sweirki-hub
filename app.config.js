export default ({ config }) => ({
  ...config,

  name: "Sweirki Sudoku",
  slug: "sam-sudoku-relinked-v2",
  version: "4.2.1",

  assetBundlePatterns: ["**/*"],

  extra: {
    eas: {
      projectId: "c4fddd7b-dab8-45ae-96b4-38d755292c3f",
    },
  },

  ...(process.env.EXPO_PREBUILD
    ? {}
    : {
        orientation: "portrait",
        scheme: "sweirki",
        icon: "./assets/icon.png",

        splash: {
          image: "./assets/splash.png",
          resizeMode: "contain",
          backgroundColor: "#000000",
        },

        ios: {
          supportsTablet: true,
          bundleIdentifier: "com.sweirki.sudoku",
          buildNumber: "16",
          infoPlist: {
            ITSAppUsesNonExemptEncryption: false,
          },
        },

        android: {
          package: "com.gamesworld.samsudoko",
          versionCode: 24,
          backgroundColor: "#000000",

          permissions: [
            "com.android.vending.BILLING",
            "android.permission.VIBRATE"
          ],

          blockedPermissions: [
            "android.permission.FOREGROUND_SERVICE",
            "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK"
          ],

          adaptiveIcon: {
            foregroundImage: "./assets/icon.png",
            backgroundColor: "#e6f0ff",
          },

          config: {
            googleMobileAdsAppId:
              "ca-app-pub-9603430285076746~3724641130",
          },
        },

        web: {
          favicon: "./assets/icon.png",
        },

        plugins: [
          "expo-asset",

          // ❌ REMOVED expo-audio
          // ❌ REMOVED expo-video

          "expo-font",
          "expo-web-browser",

          [
            "react-native-google-mobile-ads",
            {
              androidAppId:
                "ca-app-pub-9603430285076746~3724641130",
              iosAppId:
                "ca-app-pub-9603430285076746~1458002511",
              delayAppMeasurementInit: true,
            },
          ],

          [
            "expo-build-properties",
            {
              ios: {
                useFrameworks: "static",
              },
            },
          ],

          "expo-router",
        ],
      }),
});