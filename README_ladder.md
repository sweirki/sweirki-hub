\# 🏆 Ladder Package



This package implements and tests the \*\*scoring + leaderboard system\*\* for Sudoku.



---



\## 📂 Files



\- scoreConfig.ts → All multipliers, penalties, bonuses  

\- scoreEngine.ts → Core scoring function  

\- scoreTest.ts → Sanity test cases  

\- scoreMockDaily.ts → Daily leaderboard simulation  

\- scoreMockAllTime.ts → All-time ladder simulation  

\- scoreMockAchievements.ts → Achievement unlocks  

\- scoreEdgeCases.ts → Extreme abuse tests  

\- scoreSimRandom.ts → Random stress test  

\- scoreSimTournament.ts → Tournament winners  

\- scoreRunAll.ts → Master runner  

\- index.ts → Barrel file  



---



\## 🏁 Running Tests



In the `utils` folder:



```bash

npx ts-node scoreRunAll.ts



