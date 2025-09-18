import * as FileSystem from "expo-file-system";

const APP_ID = "sweirki_574706_98a9b6";
const APP_KEY = "3d61eba864f47fceed9b98bf4067ac62f9865b0466206241e5e7824c20d0dbf6";

export async function runOCR(uri: string) {
  try {
    // Read image as Base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });

    // Payload for MathPix
    // Payload for MathPix
const body = {
  src: `data:image/png;base64,${base64}`,
  formats: ["text", "latex_styled"],
};


    // Call MathPix
    const res = await fetch("https://api.mathpix.com/v3/text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "app_id": APP_ID,
        "app_key": APP_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log("📡 MathPix Raw Response:", JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.error("❌ OCR Engine Error:", err);
    throw err;
  }
}
