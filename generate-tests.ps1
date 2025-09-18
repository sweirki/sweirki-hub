# Mega Calculus Test Image Generator
New-Item -ItemType Directory -Path "C:\math\tools" -Force | Out-Null
New-Item -ItemType Directory -Path "C:\math\tests" -Force | Out-Null

Set-Content -Path "C:\math\tools\generateTestImages.js" -Value @'
const mjAPI = require('mathjax-node');
const { createCanvas } = require('canvas');
const fs = require('fs');

mjAPI.config({ MathJax: { SVG: { font: 'TeX' } } });
mjAPI.start();

const problems = [
  "d/dx(x^2+3x+2)",
  "[0,1] x^2 dx",
  "lim(x->0, sin(x)/x)",
  "series(exp(x),x,0,5)",
  "ode(y''+y=0)",
  "G(5)",
  "B(2,3)"
];

problems.forEach((expr, i) => {
  const canvas = createCanvas(700, 120);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 700, 120);
  ctx.fillStyle = 'black';
  ctx.font = '28px Arial';
  ctx.fillText(expr, 20, 60);
  const out = C:/math/tests/test.png;
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(out, buf);
  console.log(' Generated', out);
});
'@

node C:\math\tools\generateTestImages.js
