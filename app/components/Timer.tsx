import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, AppState, AppStateStatus } from "react-native";
import { getColors, theme } from "../../theme";

interface TimerProps {
  isActive: boolean;
  onTimeUpdate?: (time: number) => void;
}

export default function Timer({ isActive, onTimeUpdate }: TimerProps) {
  const [time, setTime] = useState(0);
  const [appState, setAppState] = useState(AppState.currentState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const colors = getColors();

  // âœ… handle main timer updates
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          const newTime = prev + 1;
          if (onTimeUpdate) onTimeUpdate(newTime);
          return newTime;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  // âœ… pause/resume on background/foreground
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (appState.match(/active/) && nextAppState.match(/inactive|background/)) {
          // going to background â†’ pause timer
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else if (appState.match(/inactive|background/) && nextAppState === "active") {
          // coming back â†’ resume if game still active
          if (isActive && !intervalRef.current) {
            intervalRef.current = setInterval(() => {
              setTime((prev) => {
                const newTime = prev + 1;
                if (onTimeUpdate) onTimeUpdate(newTime);
                return newTime;
              });
            }, 1000);
          }
        }
        setAppState(nextAppState);
      }
    );

    return () => {
      subscription.remove();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [appState, isActive]);

  // format mm:ss
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <View style={styles(colors).container}>
      <Text style={styles(colors).text}>{formatted}</Text>
    </View>
  );
}

const styles = (colors: ReturnType<typeof getColors>) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.timerBg,
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: theme.spacing.borderRadius,
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.timerText,
    },
  });

