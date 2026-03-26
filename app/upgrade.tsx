import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import Purchases from "react-native-purchases";
import { useRevenueCat } from "../src/hooks/useRevenueCat";
import type { PurchasesPackage } from "react-native-purchases";

export default function UpgradeScreen() {
  const { isPremium, loading, refresh, offerings } = useRevenueCat();
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const lifetimePackage: PurchasesPackage | null =
    offerings?.current?.availablePackages?.[0] ?? null;

  const buyLifetime = async () => {
    if (!lifetimePackage) return;
    try {
      await Purchases.purchasePackage(lifetimePackage);
      await refresh();


        } catch {
    setPurchaseError("Unable to complete purchase right now.");
  }

  };

  const restore = async () => {
    try {
      const info = await Purchases.restorePurchases();
      await refresh();

      if (info?.entitlements?.active?.premium) {
        setRestoreMessage("Premium access has been restored on this account.");
      } else {
        setRestoreMessage("No previous premium purchase was found.");
      }
    } catch {
      setRestoreMessage("Unable to restore purchases at this time.");
    }
  };

  React.useEffect(() => {
    if (!purchaseError) return;
    const t = setTimeout(() => setPurchaseError(null), 2500);
    return () => clearTimeout(t);
  }, [purchaseError]);


  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Checking premium status…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upgrade to Premium</Text>
      <Text style={styles.subtitle}>
        Support the app and unlock advanced Sudoku challenges.
      </Text>

      <View style={styles.features}>
        <Text style={styles.feature}>• Advanced boards (Killer, Hyper, X)</Text>
        <Text style={styles.feature}>• Ranked seasons & leaderboards</Text>
        <Text style={styles.feature}>• Premium daily challenges</Text>
        <Text style={styles.feature}>• Lifetime access — one-time purchase</Text>
      </View>

      {isPremium && (
        <Text style={styles.footer}>Premium is active on this account</Text>
      )}

      {!isPremium && lifetimePackage && (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={buyLifetime}
          activeOpacity={0.85}
        >
        <Text style={styles.primaryText}>
  Unlock Premium — {lifetimePackage.product.priceString}
</Text>

        </TouchableOpacity>
      )}

{purchaseError && (
  <Text style={styles.footer}>{purchaseError}</Text>
)}


      <TouchableOpacity onPress={restore}>
        <Text style={styles.restore}>Restore Purchase</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        No ads · One-time purchase · Restore anytime
      </Text>

      <Modal
        transparent
        visible={!!restoreMessage}
        animationType="fade"
        onRequestClose={() => setRestoreMessage(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Restore Purchase</Text>
            <Text style={styles.modalText}>{restoreMessage}</Text>

            <TouchableOpacity
              onPress={() => setRestoreMessage(null)}
              style={styles.modalSingleConfirm}
            >
              <Text style={styles.modalConfirmText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#061B3A",
    padding: 24,
    paddingTop: 78,
    alignItems: "center",
  },
  center: {
    flex: 1,
    backgroundColor: "#061B3A",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4ce70f",
    marginBottom: 6,
  },
  subtitle: {
    color: "#B9C4D6",
    textAlign: "center",
    marginBottom: 40,
    fontSize: 12,
  },
  features: {
    width: "100%",
    marginBottom: 32,
  },
  feature: {
    color: "#FFFFFF",
    fontSize: 13,
    marginBottom: 14,
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: "#F6C76B",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#061B3A",
     textAlign: "center",
  },
  restore: {
    color: "#B9C4D6",
    marginTop: 10,
    fontSize: 11,
  },
  footer: {
    marginTop: 16,
    fontSize: 11,
    color: "#7F8BA3",
    textAlign: "center",
  },
  muted: {
    color: "#B9C4D6",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "80%",
    backgroundColor: "#0B1E3A",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FBE7A1",
    textAlign: "center",
    marginBottom: 8,
  },
  modalText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom: 20,
  },
  modalSingleConfirm: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F6C76B",
    alignItems: "center",
  },
  modalConfirmText: {
    color: "#10223D",
    fontWeight: "800",
  },
});
