const isCI =
  process.env.CI === "true" ||
  process.env.EAS_BUILD === "true" ||
  process.env.EXPO_BUILD === "true";

if (isCI) {
  console.log("[postinstall] CI/EAS detected — skipping PowerShell scripts");
  process.exit(0);
}

const { execSync } = require("child_process");

execSync("npm run fix-bom", { stdio: "inherit" });
execSync("npm run validate-configs", { stdio: "inherit" });
