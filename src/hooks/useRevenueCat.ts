import { useEffect, useState } from "react";
import Purchases from "react-native-purchases";
import type { CustomerInfo, PurchasesOfferings } from "react-native-purchases";

export function useRevenueCat() {
    let refreshing = false;

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);

  // 🔒 DEFAULT: FREE until proven otherwise
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  // NOTE:
  // "premium" is the canonical entitlement ID configured in RevenueCat
  // All premium checks across the app MUST use this hook


  const computeIsPremium = (info: CustomerInfo | null) => {
    return Boolean(info?.entitlements.active["premium"]);
  };

   const refreshCustomerInfo = async () => {
    if (refreshing) return;
    refreshing = true;

    try {
      setLoading(true);
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      setIsPremium(computeIsPremium(info));
    } catch {
      // On ANY failure → treat as FREE
      setCustomerInfo(null);
      setIsPremium(false);
    } finally {
      setLoading(false);
      refreshing = false;
    }
  };


  useEffect(() => {
    let alive = true;

    // 🧹 RESET LOCAL STATE ON MOUNT
    setCustomerInfo(null);
    setIsPremium(false);
    setLoading(true);

    // 🔄 Explicit refresh
    refreshCustomerInfo();

    // 🔔 Listen for RevenueCat updates (login / restore / purchase)
    const listener = Purchases.addCustomerInfoUpdateListener((info) => {
  if (!alive) return;
  setCustomerInfo(info);
  setIsPremium(computeIsPremium(info));
  setLoading(false);
});


    // 🛒 Offerings are optional and non-fatal
    Purchases.getOfferings()
      .then((offs) => alive && setOfferings(offs))
      .catch(() => {});

    return () => {
      alive = false;
      listener?.remove?.();
    };
  }, []);

  return {
    isPremium,
    loading,
    customerInfo,
    offerings,
    refresh: refreshCustomerInfo, // explicit manual refresh if needed
  };
}
