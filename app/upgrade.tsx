import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import React from "react";
import Purchases from "react-native-purchases";
import { useRevenueCat } from "../src/hooks/useRevenueCat";
import type { PurchasesPackage } from "react-native-purchases";
export default function UpgradeScreen() {
 
 const { isPremium, loading, refresh, offerings } = useRevenueCat();
  const [restoreMessage, setRestoreMessage] = React.useState<string | null>(null);

   const labelForPackage = (pkg: PurchasesPackage) => {
    const id = (pkg.identifier || "").toLowerCase();
    const productId = (pkg.product?.identifier || "").toLowerCase();

    const key = `${id} ${productId}`;

    if (key.includes("year")) return "Sweirki Plus — Yearly";
    if (key.includes("month")) return "Sweirki Plus — Monthly";

    // fallback if identifiers are unexpected
    return "Sweirki Plus";
  };

 const buy = async (pkg: PurchasesPackage) => {
  try {
    await Purchases.purchasePackage(pkg);
    await refresh();
  } catch {
    // user cancelled or error
  }
};

 const restore = async () => {
  try {
    const result = await Purchases.restorePurchases();
    await refresh();

    if (result?.activeSubscriptions?.length) {
      setRestoreMessage("✅ Premium restored successfully");
    } else {
      setRestoreMessage("ℹ️ No previous purchases found for this account");
    }
  } catch {
    setRestoreMessage("⚠️ Restore unavailable on this app version");
  }
};


  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Checking subscription…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sweirki Sudoku Premium</Text>
   <Text style={styles.subtitle}>
  What changes when you upgrade
</Text>



    <View style={styles.features}>
  <Text style={styles.feature}>• Play all advanced Sudoku variants</Text>
  <Text style={styles.feature}>• Customize your avatar and identity</Text>
  <Text style={styles.feature}>• Progress is tracked across all modes</Text>
  <Text style={styles.feature}>• Daily puzzles remain once per day</Text>
</View>



 {isPremium && (
  <Text style={styles.footer}>
    Premium is active on this account
  </Text>
)}



{!isPremium &&
  offerings?.current?.availablePackages?.map(
    (pkg: PurchasesPackage) => (
      <TouchableOpacity

        key={pkg.identifier}
        style={styles.primaryBtn}
        onPress={() => buy(pkg)}
        activeOpacity={0.85}
      >
       <Text style={styles.primaryText}>
  {labelForPackage(pkg)}
</Text>

        <Text style={styles.price}>
          {pkg.product.priceString}
        </Text>
      </TouchableOpacity>
    )
  )}


      <TouchableOpacity onPress={restore}>
        <Text style={styles.restore}>Restore Purchase</Text>
      </TouchableOpacity>

    <Text style={styles.footer}>
  No ads · Restore purchases anytime
</Text>

<Modal
  transparent
  visible={!!restoreMessage}
  animationType="fade"
  onRequestClose={() => setRestoreMessage(null)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>Restore Purchases</Text>
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
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    backgroundColor: "#061B3A",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  subtitle: {
    color: "#B9C4D6",
    textAlign: "center",
    marginBottom: 24,
  },
  features: {
    width: "100%",
    marginBottom: 24,
  },
  feature: {
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 8,
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
    fontSize: 18,
    fontWeight: "800",
    color: "#061B3A",
  },
  price: {
    fontSize: 14,
    color: "#061B3A",
  },
  secondaryBtn: {
    marginBottom: 16,
  },
  secondaryText: {
    color: "#F6C76B",
    fontSize: 16,
    fontWeight: "600",
  },
  premium: {
    color: "#F6C76B",
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 24,
  },
  restore: {
    color: "#B9C4D6",
    marginTop: 8,
  },
  footer: {
    marginTop: 16,
    fontSize: 12,
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
  fontSize: 18,
  fontWeight: "800",
  color: "#FBE7A1",
  textAlign: "center",
  marginBottom: 10,
},

modalText: {
  fontSize: 14,
  color: "rgba(255,255,255,0.9)",
  textAlign: "center",
  marginBottom: 20,
},

modalSingleConfirm: {
  marginTop: 10,
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

