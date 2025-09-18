import * as FileSystem from "expo-file-system/legacy";

const APP_ID = "sweirki_574706_98a9b6";
const APP_KEY = "3d61eba864f47fceed9b98bf4067ac62f9865b0466206241e5e7824c20d0dbf6";

export async function runOCR(uri: string) {
  try {
    console.log("📂 Reading file as Base64:", uri);

    // Read image as Base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });
    console.log("✅ File read complete, size:", base64.length);

    // Payload for MathPix
    const body = {
      src: `data:image/png;base64,${base64}`,
      formats: ["text", "latex_styled"],
    };

    console.log("📡 Sending request to MathPix API...");

    const res = await fetch("https://api.mathpix.com/v3/text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "app_id": APP_ID,
        "app_key": APP_KEY,
      },
      body: JSON.stringify(body),
    });

    console.log("📡 MathPix response status:", res.status);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`MathPix request failed: ${res.status} → ${errText}`);
    }

    const data = await res.json();
    console.log("📡 MathPix Raw Response:", JSON.stringify(data, null, 2));

    return data;
  } catch (err) {
    console.error("❌ OCR Engine Error:", err);
    throw err;
  }
}
