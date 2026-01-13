import { useFonts } from "expo-font";
import { ActivityIndicator, View } from "react-native";

export default function FontProvider({ children }) {
  const [loaded] = useFonts({
    Nunito: require("../assets/fonts/Nunito.ttf"),
  });

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return <>{children}</>;
}

