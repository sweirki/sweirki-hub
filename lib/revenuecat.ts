import Purchases, { CustomerInfo, Offerings, Package } from "react-native-purchases";
import { Platform, Alert } from "react-native";

/**
 * RevenueCat configuration
 * -------------------------------------------------------------
 * Safe client key (use Test key for development / Production key for release)
 */
const REVENUECAT_API_KEY = "goog_NtUdbxPIOUQdzHZMgxdlujFexkP";

/**
 * Initialize RevenueCat
 * -------------------------------------------------------------
 * Call this once, ideally in _layout.tsx
 */
export async function initRevenueCat() {
  try {
    const isExpoGo = !!global.Expo;
    if (isExpoGo) {
      console.log("âš™ï¸ [RevenueCat] Expo Go detected â†’ running in Browser Mode");
      return;
    }

    // prevent duplicate init
    if ((Purchases as any)._initialized) {
      console.log("â„¹ï¸ [RevenueCat] Already initialized. Skipping duplicate init.");
      return;
    }

    // configure the SDK
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    (Purchases as any)._initialized = true;

    console.log("âœ… [RevenueCat] Initialized successfully (key active).");

    // âœ… small delay ensures native side is ready before fetching info
    setTimeout(async () => {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        console.log("ðŸ‘¤ [RevenueCat] Customer Info:", JSON.stringify(customerInfo, null, 2));
      } catch (err) {
        console.warn("âš ï¸ [RevenueCat] Customer Info fetch delayed:", err);
      }
    }, 500);
  } catch (error: any) {
    console.error("âŒ [RevenueCat] Initialization error:", error);
  }
}

/**
 * Fetch available offerings
 * -------------------------------------------------------------
 */
export async function getOfferings(): Promise<Offerings | null> {
  try {
    if (!!global.Expo) {
      console.log("âš™ï¸ [RevenueCat] Offerings disabled in Expo Go mode.");
      return null;
    }

    const offerings = await Purchases.getOfferings();
    if (offerings.current) {
      console.log("ðŸ›ï¸ [RevenueCat] Offerings fetched:", offerings.current.identifier);
      return offerings;
    } else {
      console.warn("âš ï¸ [RevenueCat] No active offerings found.");
      return null;
    }
  } catch (error: any) {
    console.error("âŒ [RevenueCat] getOfferings() failed:", error);
    return null;
  }
}

/**
 * Purchase selected package
 * -------------------------------------------------------------
 */
export async function purchasePackage(selectedPackage: Package) {
  try {
    if (!!global.Expo) {
      Alert.alert("Simulated Purchase", "Running inside Expo Go â€“ purchase simulated.");
      console.log("ðŸ§ª [RevenueCat] Simulated purchase:", selectedPackage.identifier);
      return;
    }

    console.log("ðŸ›ï¸ [RevenueCat] Purchasing:", selectedPackage.identifier);
    const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
    console.log("âœ… [RevenueCat] Purchase complete:", JSON.stringify(customerInfo, null, 2));
    Alert.alert("Purchase Complete", "Thank you! Your purchase was successful.");
  } catch (error: any) {
    if (!error.userCancelled) {
      console.error("âŒ [RevenueCat] purchasePackage() failed:", error);
      Alert.alert("Purchase Failed", error.message || "Something went wrong.");
    } else {
      console.log("ðŸŸ¡ [RevenueCat] Purchase cancelled by user.");
    }
  }
}

/**
 * Restore previous purchases
 * -------------------------------------------------------------
 */
export async function restorePurchases(): Promise<CustomerInfo | null> {
  try {
    if (!!global.Expo) {
      Alert.alert("Restore Simulated", "Expo Go mode â€“ restore simulated.");
      console.log("ðŸ§ª [RevenueCat] Simulated restore in Expo Go.");
      return null;
    }

    console.log("â™»ï¸ [RevenueCat] Restoring purchases...");
    const customerInfo = await Purchases.restorePurchases();
    Alert.alert("Restore Complete", "Your previous purchases have been restored.");
    console.log("âœ… [RevenueCat] Restored Customer Info:", JSON.stringify(customerInfo, null, 2));
    return customerInfo;
  } catch (error: any) {
    console.error("âŒ [RevenueCat] restorePurchases() failed:", error);
    Alert.alert("Restore Failed", error.message || "Could not restore purchases.");
    return null;
  }
}

/**
 * Check if user owns ad_free entitlement
 * -------------------------------------------------------------
 */
export async function hasAdFreeEntitlement(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    const active = info.entitlements.active;
    const hasAdFree = !!active["ad_free"];
    console.log("ðŸ”Ž [RevenueCat] hasAdFreeEntitlement:", hasAdFree);
    return hasAdFree;
  } catch (error) {
    console.error("âŒ [RevenueCat] hasAdFreeEntitlement() error:", error);
    return false;
  }
}

export default {
  initRevenueCat,
  getOfferings,
  purchasePackage,
  restorePurchases,
  hasAdFreeEntitlement,
};

