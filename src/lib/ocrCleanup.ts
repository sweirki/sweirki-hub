// ocrCleanup.ts
// 🦾 Mega cleanup for OCR math text

/**
 * Aggressively normalizes and corrects common OCR mistakes in math input.
 * Handles Unicode symbols, mixed fraction formats, implicit multiplication, superscripts, brackets, and more.
 * Designed for unambiguous parsing by algebra libraries like Nerdamer.
 */
export function normalizeExpr(expr: string): string {
  // Step 1: Lowercase
  let cleaned = expr.toLowerCase();

  // Step 2: Normalize multiplication symbols
  cleaned = cleaned.replace(/×|✕|∙|·|⨉|＊/g, "*");

  // Step 3: Normalize division symbols
  cleaned = cleaned.replace(/÷|⁄|∕|⧸|／/g, "/");

  // Step 4: Normalize plus symbols (fullwidth, Unicode)
  cleaned = cleaned.replace(/＋|➕|﹢/g, "+");

  // Step 5: Normalize minus symbols (various Unicode)
  cleaned = cleaned.replace(/−|–|—|‑|﹣|－/g, "-");

  // Step 6: Remove extraneous equals (multiple equals from OCR)
  cleaned = cleaned.replace(/={2,}/g, "=");

  // Step 7: Insert * between digit and variable/parenthesis (e.g., 5x → 5*x, 2(x+1) → 2*(x+1))
  cleaned = cleaned.replace(/(\d)([a-zA-Z(])/g, "$1*$2");

  // Step 8: Convert mixed fraction format (e.g. 1 1/2 → 1+1/2)
  cleaned = cleaned.replace(/(\d+)\s+(\d+)\/(\d+)/g, "$1+$2/$3");

  // Step 9: Normalize exponentiation symbols (caret, Unicode)
  cleaned = cleaned.replace(/[\^˄˅⁺]/g, "^");

  // Step 10: Convert Unicode superscript digits (x² → x^2)
  cleaned = cleaned.replace(/([a-zA-Z0-9])([\u2070-\u2079])/g, (match, base, sup) => {
    // Unicode superscript digits are \u2070 (0) to \u2079 (9)
    const digit = String.fromCharCode(sup.charCodeAt(0) - 0x2070 + 0x30);
    return `${base}^${digit}`;
  });

  // Step 11: Remove spaces
  cleaned = cleaned.replace(/\s+/g, "");

  // Step 12: Remove invisible Unicode characters (zero-width etc)
  cleaned = cleaned.replace(/[\u200B-\u200F\uFEFF]/g, "");

  // Step 13: Remove stray underscores (x_2 → x2)
  cleaned = cleaned.replace(/_+(\d+)/g, "$1");

  // Step 14: Remove stray commas (x,2 → x2)
  cleaned = cleaned.replace(/,(\d)/g, "$1");

  // Step 15: Normalize brackets (convert [ and { to (), ] and } to ))
  cleaned = cleaned.replace(/[\[\{]/g, "(");
  cleaned = cleaned.replace(/[\]\}]/g, ")");

  // Step 16: Fix OCR for absolute value |x| (multiple pipes → one)
  cleaned = cleaned.replace(/\|\|/g, "|");

  // Step 17: Remove leading/trailing non-math chars
  cleaned = cleaned.replace(/^[^\w(]+|[^\w)]$/g, "");

  return cleaned;
}
