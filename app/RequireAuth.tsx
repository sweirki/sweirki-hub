import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../firebase";

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!auth.currentUser) {
      router.replace("/login");
    }
  }, []);

  if (!auth.currentUser) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#061B3A",
        }}
      >
        <ActivityIndicator size="large" color="#F6C76B" />
      </View>
    );
  }

  return <>{children}</>;
}
