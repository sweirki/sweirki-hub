import { View, Text, Button } from "react-native";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}> Sweirki Games Hub</Text>

      <View style={{ marginTop: 10 }}>
        <Link href="/sudoku" asChild>
          <Button title=" Play Sweirki Sudoku" />
        </Link>
      </View>

      <View style={{ marginTop: 10 }}>
        <Link href="/match" asChild>
          <Button title=" Play Sweirki Match" />
        </Link>
      </View>

      <View style={{ marginTop: 10 }}>
        <Link href="/runner" asChild>
          <Button title=" Play Sweirki Runner" />
        </Link>
      </View>

      <View style={{ marginTop: 10 }}>
        <Link href="/profile" asChild>
          <Button title=" Profile" />
        </Link>
      </View>
    </View>
  );
}
