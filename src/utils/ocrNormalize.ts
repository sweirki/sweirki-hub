export function cleanOCR(latex: string): string {
  let expr = latex
    // --- Strip LaTeX wrappers ---
    .replace(/\\left/g, "")
    .replace(/\\right/g, "")
    .replace(/\\text\s*{\s*ode\s*}/gi, "ODE")
    .replace(/\\text\s*{\s*\"\s*}/g, "''")
    .replace(/\\text\s*{\s*\+\s*}/g, "+")
    .replace(/\\text\s*{\s*-\s*}/g, "-")
    .replace(/\\text\s*{\s*=\s*}/g, "=")
    .replace(/\\text\s*{\s*/g, "")
    .replace(/}/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // --- Exponents ---
  // \wedge → ^
  expr = expr.replace(/\^\s*\\wedge\s*/g, "^");
  // Cases like x^{\wedge 2+3x+2} → x^(2+3x+2)
  expr = expr.replace(/\^\s*\\wedge\s*([^)]+)/g, "^($1)");

  // --- Derivatives ---
  expr = expr
    .replace(/y\s*''/g, "diff(y(x),x,2)")
    .replace(/y\s*'/g, "diff(y(x),x,1)")
    .replace(/d\s*y\s*\/\s*d\s*x/gi, "diff(y(x),x,1)")
    .replace(/d\^?2\s*y\s*\/\s*d\s*x\^?2/gi, "diff(y(x),x,2)");

  // General form: d/dx(something) → diff(something,x)
  expr = expr.replace(/d\s*\/\s*d\s*x\s*\(*([^)]+)\)*/gi, (m, inner) => {
    return `diff(${inner},x)`;
  });

  // --- Integrals ---
  // Definite integral: \int[a,b] f(x) dx → integral(f(x),x,a,b)
  expr = expr.replace(/\\int\[(.*?),(.*?)\]\s*(.*?)d x/gi, "integral($3,x,$1,$2)");
  // Indefinite integral: \int f(x) dx → integral(f(x),x)
  expr = expr.replace(/\\int\s*(.*?)d x/gi, "integral($1,x)");

  // --- Replace bare y with y(x), but avoid double-wrapping ---
  expr = expr.replace(/\by(?!\()/g, "y(x)");

  // --- Unsupported special functions ---
  if (/^B\(/i.test(expr) || /^Γ\(/i.test(expr) || /^Gamma\(/i.test(expr)) {
    return "/* Unsupported special function: " + expr + " */";
  }

  // --- Strip ODE wrapper if present ---
  if (/^ODE\(/i.test(expr)) {
    expr = expr.replace(/^ODE\((.*)\)$/i, "$1");
  }

  // --- Empty check ---
  if (!expr || expr.length === 0) {
    return "/* Empty OCR result */";
  }

  return expr;
}
