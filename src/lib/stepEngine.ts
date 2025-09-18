import nerdamer from "nerdamer";
import "nerdamer/Algebra";
import "nerdamer/Calculus";
import "nerdamer/Solve";
import "nerdamer/Extra";

import { normalizeExpr } from "./ocrCleanup";

// Supported variable list (can expand as needed)
export const getSupportedVariables = () => ["x", "y", "z"];

export interface Step {
  type: "comment" | "math" | "final";
  text: string;
}

// Types of equations supported
export type EquationType =
  | "absolute"
  | "inequality"
  | "system"
  | "quadratic"
  | "polynomial"
  | "rational"
  | "linear"
  | "generic";

// Classify equation type based on input string
export function classifyEquation(expr: string): { type: EquationType } {
  const e = normalizeExpr(expr);
  if (e.includes("|")) return { type: "absolute" };
  if (/[<>]/.test(e)) return { type: "inequality" };
  if (e.includes(";")) return { type: "system" };
  if (/\^2/.test(e)) return { type: "quadratic" };
  if (/\^3|\^4|\^5/.test(e)) return { type: "polynomial" };
  if (e.includes("/") && e.includes("=")) return { type: "rational" };
  if (e.includes("=")) return { type: "linear" };
  return { type: "generic" };
}

// Solve the equation and return steps and final answer
export function solveEquation(expr: string, variable: string): { steps: Step[]; answer: string } {
  const { type } = classifyEquation(expr);
  let steps: Step[] = [];
  let answer = "";

  switch (type) {
    case "linear":
      steps = solveLinear(expr, variable);
      break;
    case "quadratic":
      steps = solveQuadratic(expr, variable);
      break;
    case "polynomial":
      steps = solvePolynomial(expr, variable);
      break;
    case "rational":
      steps = solveRational(expr, variable);
      break;
    case "absolute":
      steps = solveAbsolute(expr, variable);
      break;
    case "inequality":
      steps = solveInequality(expr, variable);
      break;
    case "system":
      steps = solveSystem(expr.split(";"), [variable]);
      break;
    default:
      steps = solveGeneric(expr, variable);
      break;
  }
  const finalStep = steps.find((s) => s.type === "final");
  answer = finalStep?.text || "";
  return { steps, answer };
}

// Helper for robust equation solving
function safeSolve(expr: string, variable: string): string[] {
  try {
    const result = nerdamer.solve(expr, variable);
    return Array.isArray(result) ? result.map(r => r.toString()) : [result.toString()];
  } catch (err: any) {
    throw new Error(`Could not solve: ${err.message}`);
  }
}

// Get coefficient for a variable's power
function safeCoeff(expanded: string, variable: string, power: number, fallback: string): string {
  try {
    return nerdamer(`coeff(${expanded}, ${variable}, ${power})`).evaluate().text();
  } catch {
    return fallback;
  }
}

// Linear equation solver
export function solveLinear(expr: string, variable: string): Step[] {
  const steps: Step[] = [];
  try {
    const cleaned = normalizeExpr(expr);
    const [lhs, rhs] = cleaned.split("=");
    if (!lhs || !rhs) throw new Error("Invalid linear format");

    steps.push({ type: "comment", text: "Linear equation detected" });
    steps.push({ type: "math", text: expr });

    const solution = safeSolve(cleaned, variable)[0];
    const coeffMatch = lhs.match(new RegExp(`(-?\\d*\\.?\\d*)${variable}`));
    if (coeffMatch) {
      const coeff = coeffMatch[1] || "1";
      steps.push({ type: "comment", text: `Divide both sides by ${coeff}` });
      steps.push({ type: "math", text: `${variable} = (${rhs}) / ${coeff}` });
    }
    steps.push({ type: "final", text: `${variable} = ${solution}` });
    return steps;
  } catch (err: any) {
    return [{ type: "final", text: `⚠️ Error solving linear: ${err.message}` }];
  }
}

// Quadratic equation solver
export function solveQuadratic(expr: string, variable: string): Step[] {
  const steps: Step[] = [];
  try {
    const cleaned = normalizeExpr(expr);
    const expanded = nerdamer(cleaned).expand().toString();

    steps.push({ type: "comment", text: "Quadratic equation detected" });
    steps.push({ type: "math", text: expr });
    steps.push({ type: "comment", text: "Rewrite in standard form ax² + bx + c = 0" });
    steps.push({ type: "math", text: expanded });

    const a = safeCoeff(expanded, variable, 2, "1");
    const b = safeCoeff(expanded, variable, 1, "0");
    const c = safeCoeff(expanded, variable, 0, "0");

    steps.push({ type: "comment", text: `Coefficients: a=${a}, b=${b}, c=${c}` });

    const discriminantExpr = `(${b})^2 - 4*(${a})*(${c})`;
    const discriminant = nerdamer(discriminantExpr).toString();
    steps.push({ type: "comment", text: `Discriminant Δ = ${discriminant}` });

    const sol1 = nerdamer(`((-1*(${b})) + sqrt(${discriminant})) / (2*(${a}))`).toString();
    const sol2 = nerdamer(`((-1*(${b})) - sqrt(${discriminant})) / (2*(${a}))`).toString();

    try {
      const Δnum = parseFloat(nerdamer(discriminant).evaluate().text());
      if (Δnum < 0) steps.push({ type: "comment", text: "Δ < 0 → Complex roots" });
      else if (Δnum === 0) steps.push({ type: "comment", text: "Δ = 0 → One real double root" });
      else steps.push({ type: "comment", text: "Δ > 0 → Two distinct real roots" });
    } catch {
      steps.push({ type: "comment", text: "Δ symbolic → roots may be exact forms" });
    }

    steps.push({ type: "final", text: `${variable}₁ = ${sol1}` });
    steps.push({ type: "final", text: `${variable}₂ = ${sol2}` });

    return steps;
  } catch (err: any) {
    return [{ type: "final", text: `⚠️ Error solving quadratic: ${err.message}` }];
  }
}

// Polynomial equation solver
export function solvePolynomial(expr: string, variable: string): Step[] {
  const steps: Step[] = [];
  try {
    steps.push({ type: "comment", text: "Polynomial equation detected" });
    steps.push({ type: "math", text: expr });
    steps.push({ type: "comment", text: "Factorize or apply root-finding" });

    const roots = safeSolve(normalizeExpr(expr), variable);
    roots.forEach((r, i) => steps.push({ type: "final", text: `${variable}${i + 1} = ${r}` }));

    return steps;
  } catch (err: any) {
    return [{ type: "final", text: `⚠️ Error solving polynomial: ${err.message}` }];
  }
}

// Rational equation solver
export function solveRational(expr: string, variable: string): Step[] {
  const steps: Step[] = [];
  try {
    steps.push({ type: "comment", text: "Rational equation detected" });
    steps.push({ type: "math", text: expr });
    steps.push({ type: "comment", text: "Multiply through by denominators to clear fractions" });

    const solutions = safeSolve(normalizeExpr(expr), variable);
    steps.push({ type: "comment", text: "Now solve the resulting polynomial" });
    solutions.forEach(s => steps.push({ type: "final", text: `${variable} = ${s}` }));

    return steps;
  } catch (err: any) {
    return [{ type: "final", text: `⚠️ Error solving rational: ${err.message}` }];
  }
}

// Absolute value equation solver
export function solveAbsolute(expr: string, variable: string): Step[] {
  const steps: Step[] = [];
  try {
    steps.push({ type: "comment", text: "Absolute value equation detected" });
    steps.push({ type: "math", text: expr });

    const [lhs, rhs] = expr.split("=");
    if (!lhs || !rhs) throw new Error("Invalid absolute format");

    const inner = lhs.replace(/\|/g, "").trim();
    const case1 = `${inner} = ${rhs}`;
    const case2 = `${inner} = -(${rhs})`;

    steps.push({ type: "comment", text: "Case 1: inside positive" });
    steps.push({ type: "math", text: case1 });
    steps.push({ type: "final", text: safeSolve(normalizeExpr(case1), variable)[0] });

    steps.push({ type: "comment", text: "Case 2: inside negative" });
    steps.push({ type: "math", text: case2 });
    steps.push({ type: "final", text: safeSolve(normalizeExpr(case2), variable)[0] });

    return steps;
  } catch (err: any) {
    return [{ type: "final", text: `⚠️ Error solving absolute: ${err.message}` }];
  }
}

// Inequality solver
export function solveInequality(expr: string, variable: string): Step[] {
  const steps: Step[] = [];
  try {
    const cleaned = normalizeExpr(expr);
    steps.push({ type: "comment", text: "Inequality detected" });
    steps.push({ type: "math", text: expr });
    steps.push({ type: "comment", text: "Isolate variable step by step" });

    const solution = nerdamer.solve(cleaned, variable).toString();
    steps.push({ type: "final", text: solution });

    return steps;
  } catch (err: any) {
    return [{ type: "final", text: `⚠️ Error solving inequality: ${err.message}` }];
  }
}

// System of equations solver
export function solveSystem(exprs: string[], variables: string[]): Step[] {
  const steps: Step[] = [];
  try {
    steps.push({ type: "comment", text: "System of equations detected" });
    exprs.forEach(e => steps.push({ type: "math", text: e }));

    const sol = nerdamer.solveEquations(exprs);

    steps.push({ type: "comment", text: "Step 1: Isolate one variable" });
    steps.push({ type: "comment", text: "Step 2: Substitute into others" });
    steps.push({ type: "comment", text: "Step 3: Solve reduced system" });

    sol.forEach((s: any) => {
      steps.push({ type: "final", text: `${s[0]} = ${s[1]}` });
    });

    return steps;
  } catch (err: any) {
    return [{ type: "final", text: `⚠️ Error solving system: ${err.message}` }];
  }
}

// Generic equation solver
export function solveGeneric(expr: string, variable: string): Step[] {
  const steps: Step[] = [];
  try {
    steps.push({ type: "comment", text: "Generic expression detected" });
    steps.push({ type: "math", text: expr });

    const sol = safeSolve(normalizeExpr(expr), variable)[0];
    steps.push({ type: "final", text: `${variable} = ${sol}` });

    return steps;
  } catch (err: any) {
    try {
      const simplified = nerdamer(normalizeExpr(expr)).toString();
      return [
        { type: "comment", text: "Simplified expression" },
        { type: "final", text: simplified },
      ];
    } catch (err2: any) {
      return [{ type: "final", text: `⚠️ Error evaluating: ${err2.message}` }];
    }
  }
}
