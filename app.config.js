export default ({ config }) => ({
  ...config,

  // ─────────────────────────────
  // App Identity
  // ─────────────────────────────
  name: "Sweirki Sudoku",
  slug: "sam-sudoku-relinked-v2",
  version: "4.2.0",

  assetBundlePatterns: ["**/*"],

  // ─────────────────────────────
  // EAS
  // ─────────────────────────────
  extra: {
    eas: {
      projectId: "c4fddd7b-dab8-45ae-96b4-38d755292c3f",
    },
  },

  // ─────────────────────────────
  // Prevent double-writing during prebuild
  // ─────────────────────────────
  ...(process.env.EXPO_PREBUILD
    ? {}
    : {
        // ─────────────────────────────
        // General
        // ─────────────────────────────
        orientation: "portrait",
        scheme: "sweirki",
        icon: "./assets/icon.png",

        splash: {
          image: "./assets/splash.png",
          resizeMode: "contain",
          backgroundColor: "#000000",
        },

        // ─────────────────────────────
        // iOS
        // ─────────────────────────────
        ios: {
          supportsTablet: true,
          bundleIdentifier: "com.sweirki.sudoku",
          buildNumber: "1",
          infoPlist: {
            ITSAppUsesNonExemptEncryption: false,
          },
        },

        // ─────────────────────────────
        // Android (LOCKED – DO NOT CHANGE)
        // ─────────────────────────────
        android: {
          package: "com.gamesworld.samsudoko",
          versionCode: 9,
          backgroundColor: "#000000",

          permissions: [
            "com.android.vending.BILLING",
            "android.permission.CAMERA",
            "android.permission.RECORD_AUDIO",
            "android.permission.MODIFY_AUDIO_SETTINGS",
            "android.permission.VIBRATE",
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

        // ─────────────────────────────
        // Web
        // ─────────────────────────────
        web: {
          favicon: "./assets/icon.png",
        },

        // ─────────────────────────────
        // Plugins (FINAL — NO RCT-Folly)
        // ─────────────────────────────
        plugins: [
          "expo-asset",
          "expo-audio",
          "expo-video",
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

          "expo-router",
        ],
      }),
});
