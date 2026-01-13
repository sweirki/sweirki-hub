// utils/adsManager.tsx
import React, { useEffect, useState } from "react";
import mobileAds, {
  BannerAd as RNGBannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
import { adConfig } from "./adConfig";
import { isAdFree } from "./premiumManager";

// ðŸ”¹ Initialize Mobile Ads
export async function initAds() {
  await mobileAds().initialize();
}

// ðŸ”¹ BannerAd component
export function BannerAd() {
  const [adFree, setAdFree] = useState(false);

  useEffect(() => {
    (async () => {
      setAdFree(await isAdFree());
    })();
  }, []);

  if (adFree) return null;

  return (
    <RNGBannerAd
      unitId={adConfig.banner || TestIds.BANNER}
      size={BannerAdSize.BANNER}
      onAdFailedToLoad={(err) => console.error("Banner error:", err)}
    />
  );
}

// ðŸ”¹ Interstitial
export async function showInterstitial() {
  const adFree = await isAdFree();
  if (adFree) return;

  const interstitial = InterstitialAd.createForAdRequest(
    adConfig.interstitial || TestIds.INTERSTITIAL
  );

  return new Promise<void>((resolve) => {
    const unsubscribe = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => interstitial.show()
    );
    interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      unsubscribe();
      resolve();
    });
    interstitial.load();
  });
}

// ðŸ”¹ Rewarded
export async function showRewarded(): Promise<boolean> {
  const adFree = await isAdFree();
  if (adFree) return false;

  const rewarded = RewardedAd.createForAdRequest(
    adConfig.rewarded || TestIds.REWARDED
  );

  return new Promise((resolve) => {
    let earned = false;
    rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      earned = true;
    });
    rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      resolve(earned);
    });
    rewarded.load();
  });
}
