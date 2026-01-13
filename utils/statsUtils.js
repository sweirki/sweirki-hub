"use strict";
// src/utils/statsUtils.ts
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRank = getRank;
exports.getBadges = getBadges;
exports.calculateStreak = calculateStreak;
/**
 * Rank helper
 */
function getRank(points) {
    if (points >= 35000)
        return "Grandmaster";
    if (points >= 20000)
        return "Master";
    if (points >= 10000)
        return "Diamond";
    if (points >= 5000)
        return "Platinum";
    if (points >= 2500)
        return "Gold";
    if (points >= 1000)
        return "Silver";
    if (points > 0)
        return "Bronze";
    return "Unranked";
}
function getBadges(stats) {
    var badges = [];
    var games = stats.games, points = stats.points, streak = stats.streak, _a = stats.avgErrors, avgErrors = _a === void 0 ? 0 : _a;
    if (streak >= 5)
        badges.push("🔥 Streak Master");
    if (points >= 10000)
        badges.push("💎 High Roller");
    if (avgErrors < 1 && games.length >= 5)
        badges.push("✨ Flawless");
    if (games.some(function (g) { return g.difficulty === "Hard"; }))
        badges.push("💪 Hard Solver");
    if (games.some(function (g) { return g.errors === 0; }))
        badges.push("Perfect Win");
    if (games.some(function (g) { return (g.time || 9999) < 120; }))
        badges.push("⚡ Speed Demon");
    if (games.length >= 50)
        badges.push("🏅 Veteran");
    if (games.length >= 100)
        badges.push("🌟 Legend");
    return Array.from(new Set(badges));
}
/**
 * Streak helper
 * - Calculates the longest streak of consecutive days played
 * - Accepts both Firestore Timestamps and ISO date strings
 */
function calculateStreak(games) {
    if (!games || games.length === 0)
        return 0;
    var dates = __spreadArray([], new Set(games
        .map(function (g) {
        if (!g.date)
            return null;
        if (typeof g.date === "string") {
            return g.date.split("T")[0];
        }
        if (g.date.toDate) {
            return g.date.toDate().toISOString().split("T")[0];
        }
        return null;
    })
        .filter(Boolean)), true).sort();
    var streak = 1;
    var best = 1;
    for (var i = 1; i < dates.length; i++) {
        var prev = new Date(dates[i - 1]);
        var curr = new Date(dates[i]);
        var diff = (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24);
        if (diff === 1) {
            streak++;
            best = Math.max(best, streak);
        }
        else {
            streak = 1;
        }
    }
    return best;
}
