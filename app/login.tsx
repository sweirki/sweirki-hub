import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { theme } from "../theme";
import { LinearGradient } from "expo-linear-gradient";
import Purchases from "react-native-purchases";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
const [popup, setPopup] = useState<{
  title: string;
  message: string;
} | null>(null);

  useEffect(() => {
    if (auth.currentUser) {
      router.replace("/");
    }
  }, []);

  const handleLogin = async () => {
  if (!email || !password) {
    setPopup({
      title: "Error",
      message: "Please enter both email and password.",
    });
    return;
  }

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    // Connect RevenueCat to this exact Firebase user
    await Purchases.logIn(uid);

    await AsyncStorage.setItem("uid", uid);
    await AsyncStorage.setItem("email", email);

    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      await AsyncStorage.setItem("username", data.username || "");
      await AsyncStorage.setItem("avatarUri", data.avatarUri || "");
    } else {
      await AsyncStorage.removeItem("username");
      await AsyncStorage.removeItem("avatarUri");
    }

    router.replace("/splash");
  } catch (err: any) {
    setPopup({
      title: "Login failed",
      message: "Invalid email or password.",
    });
  }
};
const handleForgotPassword = async () => {
  if (!email) {
   setPopup({
  title: "Forgot Password",
  message: "Please enter your email first.",
});

    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
   setPopup({
  title: "Email sent",
  message: "Check your inbox to reset your password.",
});

    
  } catch (err: any) {

  setPopup({
  title: "Error",
  message: "Unable to reset password. Please try again.",
});

  }
};

  return (
    <LinearGradient
      colors={["#0A1B3D", "#142A5C"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.titleGlow}>Login</Text>
         <TextInput
  style={styles.input}
  placeholder="Email"
placeholderTextColor="#D8B24A" // gold placeholder text
  value={email}
  onChangeText={setEmail}
  autoCapitalize="none"
  keyboardType="email-address"
/>

<TextInput
  style={styles.input}
  placeholder="Password"
  placeholderTextColor="#D8B24A" // gold placeholder text

  value={password}
  onChangeText={setPassword}
  secureTextEntry
/>

          <LinearGradient
            colors={["#FBE7A1", "#D8B24A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.85} style={styles.innerButton}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </LinearGradient>

<TouchableOpacity onPress={handleForgotPassword}>
  <Text style={styles.forgot}>Forgot password?</Text>
</TouchableOpacity>



          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.link}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      {popup && (
  <View style={styles.popupOverlay}>
    <View style={styles.popupCard}>
      <Text style={styles.popupTitle}>{popup.title}</Text>
      <Text style={styles.popupMessage}>{popup.message}</Text>
      <TouchableOpacity
        onPress={() => setPopup(null)}
        style={styles.popupButton}
      >
        <Text style={styles.popupButtonText}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  titleGlow: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FBE7A1",
    textAlign: "center",
    marginBottom: 24,
    textShadowColor: "#D8B24A",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.borderRadius,
    padding: 10,
    width: "100%",
    marginBottom: 20,
    backgroundColor: theme.colors.surface,
    color: "#D8B24A", // ðŸ‘ˆ gold text color
  },
  button: {
    borderRadius: theme.spacing.borderRadius,
    width: "100%",
    height: 50,
    marginBottom: 10,
  },
  innerButton: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  buttonText: {
    color: theme.colors.buttonPrimaryText,
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    color: "#FBE7A1",
    marginTop: 16,
    textAlign: "center",
    fontWeight: "600",
    
  },
  forgot: {
  alignSelf: "flex-end",
  color: "#FBE7A1",
  marginBottom: 24,
  fontSize: 14,
  fontWeight: "600",
},


popupOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.6)",
  justifyContent: "center",
  alignItems: "center",
},

popupCard: {
  width: "85%",
  backgroundColor: "#0A1B3D",
  borderRadius: 16,
  padding: 20,
  borderWidth: 1,
  borderColor: "#D8B24A",
},

popupTitle: {
  fontSize: 18,
  fontWeight: "800",
  color: "#FBE7A1",
  marginBottom: 8,
  textAlign: "center",
},

popupMessage: {
  fontSize: 15,
  color: "#FBE7A1",
  textAlign: "center",
  marginBottom: 16,
},

popupButton: {
  alignSelf: "center",
  paddingVertical: 10,
  paddingHorizontal: 24,
  borderRadius: 12,
  backgroundColor: "#D8B24A",
},

popupButtonText: {
  color: "#0A1B3D",
  fontWeight: "800",
  fontSize: 15,
},

});

