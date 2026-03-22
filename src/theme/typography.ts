import { Platform } from "react-native";

const familyRegular = Platform.select({
  ios: "Avenir Next",
  android: "sans-serif",
  default: "system-ui, -apple-system, Segoe UI, sans-serif",
});

const familyMedium = Platform.select({
  ios: "Avenir Next",
  android: "sans-serif-medium",
  default: "system-ui, -apple-system, Segoe UI, sans-serif",
});

const familyBold = Platform.select({
  ios: "Avenir Next",
  android: "sans-serif-medium",
  default: "system-ui, -apple-system, Segoe UI, sans-serif",
});

export const T = {
  regular: { fontFamily: familyRegular },
  medium: { fontFamily: familyMedium },
  bold: { fontFamily: familyBold },
};
