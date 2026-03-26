import Purchases from "react-native-purchases";
import { Platform } from "react-native";

export function initRevenueCat() {
  if (Platform.OS === "ios") {
    Purchases.configure({
      apiKey: "appl_gJBZCcmlolRjHxnIBjeBAxhfsYV",
    });
  } else if (Platform.OS === "android") {
    Purchases.configure({
      apiKey: "goog_hvVAdUQHiGHTItaMcMdPiaEFpTf",
    });
  }
}
