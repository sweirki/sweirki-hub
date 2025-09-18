import React, { useEffect, useState } from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [sound, setSound] = useState(true);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const data = await AsyncStorage.getItem("settings");
      if (data) {
        const parsed = JSON.parse(data);
        setDarkMode(parsed.darkMode ?? false);
        setSound(parsed.sound ?? true);
        setNotifications(parsed.notifications ?? true);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async (newSettings: any) => {
    await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
  };

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    saveSettings({ darkMode: newValue, sound, notifications });
  };

  const toggleSound = () => {
    const newValue = !sound;
    setSound(newValue);
    saveSettings({ darkMode, sound: newValue, notifications });
  };

  const toggleNotifications = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    saveSettings({ darkMode, sound, notifications: newValue });
  };

  return (
    <View style={[styles.container, darkMode && { backgroundColor: "#111" }]}>
      <Stack.Screen options={{ title: "Settings" }} />
      <Text style={[styles.title, darkMode && { color: "white" }]}>Settings</Text>

      <View style={styles.row}>
        <Text style={[styles.label, darkMode && { color: "white" }]}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, darkMode && { color: "white" }]}>Sound</Text>
        <Switch value={sound} onValueChange={toggleSound} />
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, darkMode && { color: "white" }]}>Notifications</Text>
        <Switch value={notifications} onValueChange={toggleNotifications} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "white" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  label: { fontSize: 18 },
});
