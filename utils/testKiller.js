import { generateSudoku, generateKillerCages } from "./sudokuGen.js";

const board = generateSudoku("easy");
const solution = board.map(r => r.map(c => c.solution));
console.log(generateKillerCages(solution).slice(0, 5));
