import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeType = "light" | "dark" | "blue";

const palettes: Record<ThemeType, any> = {
  light: {
    background: "#FFFFFF",
    cellBackground: "#FFFFFF",
    altCellBackground: "#F5F5F5",
    border: "#B8C6E4",
    buttonPrimaryBg: "#FBE7A1",
    buttonSecondaryBg: "#D8B24A",
    buttonPrimaryText: "#0A1B3D",
    enteredNumber: "#0A1B3D",
    givenNumber: "#000000",
    secondaryText: "#3B2A00",
    highlight: "rgba(0,0,0,0.08)",
    highlightText: "#0A1B3D",
    wrongBackground: "rgba(255,0,0,0.12)",
    wrongNumber: "#D22B2B",
    contextHighlight: "rgba(0,0,0,0.1)",
    disabled: "#C7C7C7",
    menuRed: "#A93A3A",
  },

  dark: {
    background: "#0B0B18",
    cellBackground: "#111628",
    altCellBackground: "#1A1F33",
    border: "#2C3552",
    buttonPrimaryBg: "#1F2A4D",
    buttonSecondaryBg: "#2E3A5A",
   buttonPrimaryText: "#0A1B3D",   // deep blue text
enteredNumber: "#0A1B3D",       // deep blue numbers
    givenNumber: "#FBE7A1",
    secondaryText: "#9EA7C0",
    highlight: "rgba(255,255,255,0.1)",
    highlightText: "#FBE7A1",
    wrongBackground: "rgba(255,0,0,0.18)",
    wrongNumber: "#FF5A5A",
    contextHighlight: "rgba(255,215,0,0.15)",
    disabled: "#2F3B5C",
    menuRed: "#A93A3A",
  },

  blue: {
    background: "#EAF2FF",
    cellBackground: "#FFFFFF",
    altCellBackground: "#F6FAFF",
    border: "#B8C6E4",
    buttonPrimaryBg: "#FBE7A1",
    buttonSecondaryBg: "#D8B24A",
    // ðŸŸ¡ Updated for visibility:
    buttonPrimaryText: "#FBE7A1", // bright gold for headers & icons
    enteredNumber: "#FBE7A1",     // gold timer & difficulty
    givenNumber: "#FFFFFF",       // white prefilled numbers
    secondaryText: "#C0D0F5",     // soft light-blue for hints/subtitles
    highlight: "rgba(0,0,0,0.08)",
    highlightText: "#0A1B3D",
    wrongBackground: "rgba(255,0,0,0.12)",
    wrongNumber: "#D22B2B",
    contextHighlight: "rgba(0,0,0,0.1)",
    disabled: "#C7C7C7",
    menuRed: "#A93A3A",
  },
};

export const getColors = async (current?: ThemeType) => {
  let mode: ThemeType = current || "blue";
  try {
    const saved = await AsyncStorage.getItem("appTheme");
    if (saved && ["light", "dark", "blue"].includes(saved)) {
      mode = saved as ThemeType;
    }
  } catch (err) {
    console.log("getColors error:", err);
  }
  // âœ… Guaranteed return
  return palettes[mode] || palettes.blue;
};

export const getThemeName = async (): Promise<ThemeType> => {
  try {
    const saved = await AsyncStorage.getItem("appTheme");
    if (saved && ["light", "dark", "blue"].includes(saved)) {
      return saved as ThemeType;
    }
  } catch {}
  return "blue";
};

export const strokeBase = {
  stroke: "rgba(183, 140, 47, 0.55)",
  strokeWidth: 1.6,
  strokeDasharray: "3 2",
  strokeLinecap: "butt",
  strokeLinejoin: "round",
  fill: "none",
};

export const strokeBaseBold = {
  ...strokeBase,
  strokeWidth: 2.4,
};

export const strokeBaseThin = {
  ...strokeBase,
  strokeWidth: 1.2,
};

export default palettes;
// âœ… Compatibility patch so old files keep working
export const theme = {
  spacing: (x: number) => x * 8,
};

