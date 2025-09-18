import nerdamer from "nerdamer";
import "nerdamer/Calculus";
import "nerdamer/Algebra";
import "nerdamer/Solve";
import "nerdamer/Extra";

export type Step = { step: string; color?: string };

// Utility
const makeStep = (txt: string, color = "black"): Step => ({ step: txt, color });

/* ==================== DERIVATIVES ==================== */
export function solveDerivative(expr: string, variable = "x", order = 1): Step[] {
  let steps: Step[] = [];
  try {
    steps.push(makeStep(`Differentiate ${expr} w.r.t ${variable}`));
    let res = expr;
    for (let i = 0; i < order; i++) {
      res = nerdamer(`diff(${res},${variable})`).toString();
      steps.push(makeStep(`d/d${variable} [order ${i + 1}]: ${res}`, "green"));
    }
  } catch (err: any) {
    steps.push(makeStep("Error: " + err.message, "red"));
  }
  return steps;
}

/* ==================== INTEGRALS ==================== */
export function solveIntegral(expr: string, variable = "x", lower?: string, upper?: string): Step[] {
  let steps: Step[] = [];
  try {
    if (lower && upper) {
      steps.push(makeStep(`∫[${lower}→${upper}] ${expr} d${variable}`));
      const res = nerdamer(`defint(${expr},${variable},${lower},${upper})`).toString();
      steps.push(makeStep("Final Answer: " + res, "green"));
    } else {
      steps.push(makeStep(`∫ ${expr} d${variable}`));
      const res = nerdamer(`integrate(${expr},${variable})`).toString();
      steps.push(makeStep("Final Answer: " + res, "green"));
    }
  } catch (err: any) {
    steps.push(makeStep("Error: " + err.message, "red"));
  }
  return steps;
}

/* ==================== LIMITS ==================== */
export function solveLimit(expr: string, variable: string, point: string): Step[] {
  let steps: Step[] = [];
  try {
    steps.push(makeStep(`lim (${variable}→${point}) ${expr}`));
    const res = nerdamer(`limit(${expr},${variable},${point})`).toString();
    steps.push(makeStep("Final Answer: " + res, "green"));
  } catch (err: any) {
    steps.push(makeStep("Error: " + err.message, "red"));
  }
  return steps;
}

/* ==================== SERIES ==================== */
export function solveSeries(expr: string, variable = "x", point = "0", order = 5): Step[] {
  let steps: Step[] = [];
  try {
    steps.push(makeStep(`Series expansion of ${expr} about ${variable}=${point}`));
    const res = nerdamer(`series(${expr},${variable},${point},${order})`).toString();
    steps.push(makeStep("Series: " + res, "green"));
  } catch (err: any) {
    steps.push(makeStep("Error: " + err.message, "red"));
  }
  return steps;
}

/* ==================== DIFFERENTIAL EQUATIONS ==================== */
export function solveDifferential(expr: string, variable = "x"): Step[] {
  let steps: Step[] = [];
  try {
    steps.push(makeStep(`Solve ODE: ${expr}`));
    const res = nerdamer(`odesolve(${expr},${variable})`).toString();
    steps.push(makeStep("Solution: " + res, "green"));
  } catch (err: any) {
    steps.push(makeStep("Error: " + err.message, "red"));
  }
  return steps;
}

/* ==================== SPECIAL FUNCTIONS ==================== */
export function solveGamma(expr: string): Step[] {
  return [makeStep(`Γ(${expr}) = factorial(${expr}-1)`)];
}

export function solveBeta(a: string, b: string): Step[] {
  return [makeStep(`B(${a},${b}) = Γ(${a})Γ(${b}) / Γ(${a}+${b})`)];
}
