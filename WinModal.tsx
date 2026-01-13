import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function WinModal({ visible, onPlayAgain, onMenu }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}> You Win!</Text>
          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, styles.play]} onPress={onPlayAgain}>
              <Text style={styles.text}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.menu]} onPress={onMenu}>
              <Text style={styles.text}>Back to Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    width: "80%",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  buttons: {
    flexDirection: "row",
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  play: { backgroundColor: "#4caf50" },
  menu: { backgroundColor: "#2196f3" },
  text: {
    color: "#fff",
    fontWeight: "bold",
  },
});

