import {
  CATEGORIES,
  MAX_TOTAL_SCORE,
  SCORE_EVENTS,
  TIER_NAMES,
  TierLevel,
  ScoreHistoryEntry,
  ScoreBreakdown,
  CategoryBreakdown,
} from "./types";

// ── TIER DERIVATION ───────────────────────────────────────────────────────────

/**
 * Returns the numeric tier level for a given score.
 *
 * | Score   | Level | Name      |
 * |---------|-------|-----------|
 * | 130–144 |   4   | core      |
 * | 100–129 |   3   | elite     |
 * |  60–99  |   2   | builder   |
 * |  40–59  |   1   | verified  |
 * |   0–39  |   0   | newcomer  |
 */
export function getTierLevel(score: number): TierLevel {
  if (score >= 130) return 4;
  if (score >= 100) return 3;
  if (score >= 60) return 2;
  if (score >= 40) return 1;
  return 0;
}

/**
 * Returns the tier name string for a given score.
 */
export function getTierName(score: number): string {
  return TIER_NAMES[getTierLevel(score)];
}

/**
 * Returns both tier level and name for a given score.
 */
export function getTier(score: number): { level: TierLevel; name: string } {
  const level = getTierLevel(score);
  return { level, name: TIER_NAMES[level] };
}

// ── SCORE COMPUTATION ─────────────────────────────────────────────────────────

/**
 * Applies a single score event delta and returns the new clamped score.
 * Score is always clamped between 0 and MAX_TOTAL_SCORE (144).
 */
export function applyDelta(currentScore: number, delta: number): number {
  return Math.min(MAX_TOTAL_SCORE, Math.max(0, currentScore + delta));
}

/**
 * Computes a full score breakdown from a history of score events.
 *
 * This is a pure function — it takes a list of history entries and
 * returns the total score, tier, and per-category breakdown.
 * No database or external dependencies.
 *
 * @param history - Array of score history entries (e.g. from your DB)
 * @returns ScoreBreakdown with total, tier, and category details
 *
 * @example
 * const history = [
 *   { category: "Verification Completeness", delta: 20, reason: "identity_minted" },
 *   { category: "Developer Contributions", delta: 12, reason: "github_verified" },
 * ];
 * const breakdown = computeScoreBreakdown(history);
 * // { total: 32, tier: { level: 0, name: "newcomer" }, categories: [...] }
 */
export function computeScoreBreakdown(
  history: ScoreHistoryEntry[]
): ScoreBreakdown {
  // Sum deltas per category
  const categoryTotals: Record<string, number> = {};
  for (const entry of history) {
    categoryTotals[entry.category] =
      (categoryTotals[entry.category] ?? 0) + entry.delta;
  }

  // Clamp each category between 0 and its max
  const categories: CategoryBreakdown[] = Object.values(CATEGORIES).map(
    (cat) => {
      const raw = categoryTotals[cat.name] ?? 0;
      const score = Math.min(cat.max, Math.max(0, raw));
      return {
        name: cat.name,
        score,
        max: cat.max,
        percentage: Math.round((score / cat.max) * 100),
      };
    }
  );

  const total = categories.reduce((sum, c) => sum + c.score, 0);

  return {
    total,
    tier: getTier(total),
    categories,
  };
}

/**
 * Computes a score directly from a map of event keys and counts.
 * Useful for quick calculations without a full history array.
 *
 * @param events - Object mapping event keys to occurrence counts
 * @returns ScoreBreakdown
 *
 * @example
 * const breakdown = computeScoreFromEvents({
 *   identity_minted: 1,
 *   github_verified: 1,
 *   dao_vote: 3,
 * });
 */
export function computeScoreFromEvents(
  events: Partial<Record<string, number>>
): ScoreBreakdown {
  const history: ScoreHistoryEntry[] = [];

  for (const [eventKey, count = 0] of Object.entries(events)) {
    const event = SCORE_EVENTS[eventKey];
    if (!event) continue;
    for (let i = 0; i < count; i++) {
      history.push({
        category: event.category,
        delta: event.delta,
        reason: eventKey,
      });
    }
  }

  return computeScoreBreakdown(history);
}

// ── RE-EXPORTS ────────────────────────────────────────────────────────────────
export { CATEGORIES, SCORE_EVENTS, MAX_TOTAL_SCORE, TIER_NAMES };
export type { TierLevel, ScoreHistoryEntry, ScoreBreakdown, CategoryBreakdown };
