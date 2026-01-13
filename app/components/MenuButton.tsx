import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { getColors, theme } from "../../theme";
import { playControlClick } from "../../src/sound/clickSound";

type Props = {
  title: string;
  icon?: React.ReactNode;
  variant?:
    | "green"
    | "orange"
    | "blue"
    | "red"
    | "grey"
    | "easy"
    | "medium"
    | "hard"
    | "cancel"
    | "winPlayAgain"
    | "winLeaderboard"
    | "winClose";
  onPress: () => void;
};

export default function MenuButton({ title, icon, variant = "grey", onPress }: Props) {
  const colors = getColors();
  let backgroundColor = colors.menuGreyBg;
  let textColor = colors.menuGreyText;
  let extraStyle: any = {};

  // ðŸ”¹ Normal variants (still here for other screens)
  switch (variant) {
    case "green": backgroundColor = colors.menuGreen; textColor = colors.menuText; break;
    case "orange": backgroundColor = colors.menuOrange; textColor = colors.menuText; break;
    case "blue": backgroundColor = colors.menuBlue; textColor = colors.menuText; break;
    case "red": backgroundColor = colors.menuRed; textColor = colors.menuText; break;
    case "easy": backgroundColor = colors.difficultyEasy; textColor = colors.menuText; break;
    case "medium": backgroundColor = colors.difficultyMedium; textColor = colors.menuText; break;
    case "hard": backgroundColor = colors.difficultyHard; textColor = colors.menuText; break;
    case "cancel": backgroundColor = colors.difficultyCancel; textColor = colors.menuGreyText; break;
    case "winPlayAgain": backgroundColor = colors.winPlayAgain; textColor = colors.menuText; break;
    case "winLeaderboard": backgroundColor = colors.winLeaderboard; textColor = colors.menuText; break;
    case "winClose": backgroundColor = colors.winClose; textColor = colors.menuText; break;
  }

  // ðŸ”¹ Auto-upgrade ALL board menus to unified blue
  if (["easy", "medium", "hard", "cancel"].includes(variant)) {
    backgroundColor = colors.menuBlue;   // unified BLUE
    textColor = colors.menuText;
    extraStyle = {
      borderRadius: theme.spacing.borderRadius * 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
      minWidth: 180,
    };
  }

  return (
   <TouchableOpacity
  style={[styles.button, extraStyle, { backgroundColor }]}
  onPress={async () => {
    await playControlClick();
    onPress();
  }}
  activeOpacity={0.85}
>

      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: theme.spacing.borderRadius,
    marginVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  icon: { marginRight: 8 },
  text: { fontSize: 16, fontWeight: "bold" },
});

