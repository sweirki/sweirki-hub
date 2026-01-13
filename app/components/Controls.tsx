import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { getColors } from "../theme/index";
import { playControlClick } from "../../src/sound/clickSound";


interface ControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onDelete: () => void;
  onRestart: () => void;
  onSolve: () => void;
  pencilMode: boolean;
  onTogglePencil: () => void;
  hintsLeft: number;
  disableUndo?: boolean;
  disableRedo?: boolean;
  locked?: boolean;
}

export default function Controls({
  onUndo,
  onRedo,
  onHint,
  onDelete,
  onRestart,
  onSolve,
  pencilMode,
  onTogglePencil,
  hintsLeft,
  disableUndo,
  disableRedo,
  locked,
}: ControlsProps) {
  const colors = getColors();

  const Btn = ({
    label,
    onPress,
    disabled,
    highlight,
  }: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    highlight?: boolean;
  }) => {
    const isPencil = label === "Pencil ON";

    return (
     <TouchableOpacity
  activeOpacity={0.7}
  disabled={disabled}
  onPress={async () => {
    if (disabled) return;
    await playControlClick();
    onPress();
  }}
  style={[

          styles.btn,
          {
            backgroundColor: disabled
              ? colors.disabled
              : highlight
              ? colors.buttonPrimaryBg // GOLD
              : colors.cellBackground, // WHITE

            borderColor: disabled
              ? colors.disabled
              : highlight
              ? colors.buttonSecondaryBg // DARK GOLD
              : colors.border, // Normal border
          },
        ]}
      >
        <Text
          style={[
            styles.btnText,
            {
              color: disabled
                ? "#777"
                : highlight
                ? colors.buttonPrimaryText
                : colors.enteredNumber,
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Btn label="Undo" onPress={onUndo} disabled={locked || disableUndo} />
        <Btn label="Redo" onPress={onRedo} disabled={locked || disableRedo} />
        <Btn
          label={`Hint (${hintsLeft})`}
          onPress={onHint}
          disabled={locked || hintsLeft <= 0}
          highlight={!locked && hintsLeft > 0}
        />
        <Btn label="Delete" onPress={onDelete} disabled={locked} />
      </View>

    <View style={styles.row}>
  <Btn label="Restart" onPress={onRestart} />
  <Btn
    label={pencilMode ? "Pencil ON" : "Pencil OFF"}
    onPress={onTogglePencil}
    highlight={!locked && pencilMode}
    disabled={locked}
  />
</View>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  btn: {
    flex: 1,
    height: 44,
    marginHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1.4,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
  },
});

