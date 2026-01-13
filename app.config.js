export default ({ config }) => ({
  ...config,
  name: "Sam Sudoku",
  slug: "sam-sudoku-relinked-v2",
  version: "4.1.0",
  assetBundlePatterns: ["**/*"],
  extra: {
    eas: {
      projectId: "c4fddd7b-dab8-45ae-96b4-38d755292c3f"
    }
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
  backgroundColor: "#000000"
},


        ios: {
          supportsTablet: true,
          bundleIdentifier: "com.gamesworld.samsudoko",
          buildNumber: "1"
        },

        android: {
  backgroundColor: "#000000",
  versionCode: 9,
  package: "com.gamesworld.samsudoko",
  permissions: [

            "android.permission.CAMERA",
            "android.permission.RECORD_AUDIO",
            "android.permission.MODIFY_AUDIO_SETTINGS",
            "android.permission.VIBRATE"
          ],
          adaptiveIcon: {
            foregroundImage: "./assets/icon.png",
            backgroundColor: "#e6f0ff"
          },
          // ✅ REQUIRED: AdMob App ID to prevent native crash
          config: {
            googleMobileAdsAppId: "ca-app-pub-9603430285076746~3724641130"
          }
        },

        web: {
          favicon: "./assets/icon.png"
        },

        plugins: [
          "expo-audio",
          "expo-video",
          "expo-font",
          "expo-web-browser",
          [
            "react-native-google-mobile-ads",
            {
              androidAppId: "ca-app-pub-9603430285076746~3724641130",
              iosAppId: "ca-app-pub-9603430285076746~1458002511",
              delayAppMeasurementInit: true
            }
          ],
          "expo-router"
        ]
      })
});
