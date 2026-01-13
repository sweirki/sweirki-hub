import { ImageBackground, View, StyleSheet } from "react-native";

export default function ArenaLayout({ children }: { children: React.ReactNode }) {
  return (
    <ImageBackground
      source={require("../../assets/bg.png")}
      style={styles.bg}
      resizeMode="cover"
      blurRadius={4}
    >
      <View style={styles.overlay}>{children}</View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.45)",
  paddingHorizontal: 20,
  paddingTop: 66,   // ⬅ pushes content DOWN (matches intro feel)
},

});
