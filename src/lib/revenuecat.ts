import Purchases from "react-native-purchases";
import { Platform } from "react-native";

export function initRevenueCat() {
  if (Platform.OS !== "android") return;

  Purchases.configure({
    apiKey: "goog_hvVAdUQHiGHTItaMcMdPiaEFpTf",
  });
}
