import { useEffect, useRef, useState } from "react";
import Purchases from "react-native-purchases";
import type { CustomerInfo, PurchasesOfferings } from "react-native-purchases";

/**
 * Single source of truth for Premium state
 * - Premium = entitlement id "premium"
 * - Free until proven otherwise
 * - Silent restore on app start
 */
export function useRevenueCat() {
  const refreshingRef = useRef(false);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);

  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const computeIsPremium = (info: CustomerInfo | null) => {
    return Boolean(info?.entitlements.active["premium"]);
  };

  const refreshCustomerInfo = async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;

    try {
      setLoading(true);
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      setIsPremium(computeIsPremium(info));
    } catch {
      setCustomerInfo(null);
      setIsPremium(false);
    } finally {
      setLoading(false);
      refreshingRef.current = false;
    }
  };

  useEffect(() => {
    let alive = true;

    // Silent restore on mount
    refreshCustomerInfo();

    // Listen for purchase / restore updates
    const listener = Purchases.addCustomerInfoUpdateListener((info) => {
      if (!alive) return;
      setCustomerInfo(info);
      setIsPremium(computeIsPremium(info));
      setLoading(false);
    });

    // Offerings are optional (non-fatal)
 Purchases.getOfferings()
  .then((offs) => {
    console.log("🔎 OFFERINGS:", JSON.stringify(offs, null, 2));
    alive && setOfferings(offs);
  })
  .catch((e) => {
    console.log("❌ OFFERINGS ERROR:", e);
  });


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
    refresh: refreshCustomerInfo,
  };
}
