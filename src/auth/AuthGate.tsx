import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import Purchases from "react-native-purchases";


export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

 useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (u) => {
    if (u) {
      await Purchases.logIn(u.uid).catch(() => {});
    }
    setReady(true);
  });

  return unsub;
}, []);


  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}
