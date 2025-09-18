// ocrCleanup.ts
// 🔧 Central cleanup for OCR math text

export function normalizeExpr(expr: string): string {
  return expr
    .toLowerCase()
    .replace(/×/g, "*")               // normalize Unicode times
    .replace(/·/g, "*")               // normalize dot
    .replace(/(\d)\*(?=[a-z])/g, "$1") // 5*x → 5x
    .replace(/−/g, "-")               // fix OCR minus sign
    .replace(/\s+/g, "");             // strip spaces
}
