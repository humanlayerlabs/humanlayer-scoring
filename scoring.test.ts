import {
  getTierLevel,
  getTierName,
  getTier,
  applyDelta,
  computeScoreBreakdown,
  computeScoreFromEvents,
} from "../src/scoring";
import { MAX_TOTAL_SCORE, CATEGORIES } from "../src/types";

// ── TIER DERIVATION ───────────────────────────────────────────────────────────
describe("getTierLevel", () => {
  it("returns 0 (newcomer) for score 0", () => expect(getTierLevel(0)).toBe(0));
  it("returns 0 (newcomer) for score 39", () => expect(getTierLevel(39)).toBe(0));
  it("returns 1 (verified) for score 40", () => expect(getTierLevel(40)).toBe(1));
  it("returns 1 (verified) for score 59", () => expect(getTierLevel(59)).toBe(1));
  it("returns 2 (builder) for score 60", () => expect(getTierLevel(60)).toBe(2));
  it("returns 2 (builder) for score 99", () => expect(getTierLevel(99)).toBe(2));
  it("returns 3 (elite) for score 100", () => expect(getTierLevel(100)).toBe(3));
  it("returns 3 (elite) for score 129", () => expect(getTierLevel(129)).toBe(3));
  it("returns 4 (core) for score 130", () => expect(getTierLevel(130)).toBe(4));
  it("returns 4 (core) for score 144", () => expect(getTierLevel(144)).toBe(4));
});

describe("getTierName", () => {
  it("returns 'newcomer' for score 0", () => expect(getTierName(0)).toBe("newcomer"));
  it("returns 'verified' for score 40", () => expect(getTierName(40)).toBe("verified"));
  it("returns 'builder' for score 82", () => expect(getTierName(82)).toBe("builder"));
  it("returns 'elite' for score 110", () => expect(getTierName(110)).toBe("elite"));
  it("returns 'core' for score 144", () => expect(getTierName(144)).toBe("core"));
});

describe("getTier", () => {
  it("returns level and name together", () => {
    expect(getTier(82)).toEqual({ level: 2, name: "builder" });
    expect(getTier(144)).toEqual({ level: 4, name: "core" });
  });
});

// ── DELTA APPLICATION ─────────────────────────────────────────────────────────
describe("applyDelta", () => {
  it("adds delta to current score", () => {
    expect(applyDelta(20, 12)).toBe(32);
  });

  it("clamps at MAX_TOTAL_SCORE (144)", () => {
    expect(applyDelta(140, 20)).toBe(144);
    expect(applyDelta(144, 1)).toBe(144);
  });

  it("clamps at 0 (no negative scores)", () => {
    expect(applyDelta(10, -36)).toBe(0);
    expect(applyDelta(0, -1)).toBe(0);
  });

  it("handles exact boundary values", () => {
    expect(applyDelta(0, 144)).toBe(144);
    expect(applyDelta(72, 72)).toBe(144);
  });
});

// ── SCORE BREAKDOWN ───────────────────────────────────────────────────────────
describe("computeScoreBreakdown", () => {
  it("returns zero score for empty history", () => {
    const result = computeScoreBreakdown([]);
    expect(result.total).toBe(0);
    expect(result.tier).toEqual({ level: 0, name: "newcomer" });
    result.categories.forEach((c) => {
      expect(c.score).toBe(0);
      expect(c.percentage).toBe(0);
    });
  });

  it("correctly sums a basic identity + github verification", () => {
    const history = [
      { category: CATEGORIES.VERIFICATION.name, delta: 20, reason: "identity_minted" },
      { category: CATEGORIES.DEVELOPER.name, delta: 12, reason: "github_verified" },
    ];
    const result = computeScoreBreakdown(history);
    expect(result.total).toBe(32);
    expect(result.tier.name).toBe("newcomer");

    const verification = result.categories.find(
      (c) => c.name === CATEGORIES.VERIFICATION.name
    );
    expect(verification?.score).toBe(20);

    const developer = result.categories.find(
      (c) => c.name === CATEGORIES.DEVELOPER.name
    );
    expect(developer?.score).toBe(12);
  });

  it("clamps category score at its max (36)", () => {
    // Try to overflow a single category far beyond max
    const history = Array(20).fill({
      category: CATEGORIES.DEVELOPER.name,
      delta: 8,
      reason: "hackathon_submission",
    });
    const result = computeScoreBreakdown(history);
    const developer = result.categories.find(
      (c) => c.name === CATEGORIES.DEVELOPER.name
    );
    expect(developer?.score).toBe(36);
    expect(result.total).toBeLessThanOrEqual(MAX_TOTAL_SCORE);
  });

  it("handles slash penalty correctly", () => {
    const history = [
      { category: CATEGORIES.VERIFICATION.name, delta: 20, reason: "identity_minted" },
      { category: CATEGORIES.VERIFICATION.name, delta: 4, reason: "stake_created" },
      { category: CATEGORIES.VERIFICATION.name, delta: -36, reason: "slashed" },
    ];
    const result = computeScoreBreakdown(history);
    const verification = result.categories.find(
      (c) => c.name === CATEGORIES.VERIFICATION.name
    );
    // 20 + 4 - 36 = -12, clamped to 0
    expect(verification?.score).toBe(0);
    expect(result.total).toBe(0);
  });

  it("computes percentage correctly", () => {
    const history = [
      { category: CATEGORIES.DEVELOPER.name, delta: 18, reason: "github_verified" },
    ];
    const result = computeScoreBreakdown(history);
    const developer = result.categories.find(
      (c) => c.name === CATEGORIES.DEVELOPER.name
    );
    expect(developer?.percentage).toBe(50); // 18/36 = 50%
  });

  it("Jeff's wallet — score 82 should be builder tier", () => {
    const history = [
      { category: CATEGORIES.VERIFICATION.name, delta: 20, reason: "identity_minted" },
      { category: CATEGORIES.DEVELOPER.name, delta: 12, reason: "github_verified" },
      { category: CATEGORIES.VERIFICATION.name, delta: 4, reason: "stake_created" },
      { category: CATEGORIES.PLATFORM.name, delta: 8, reason: "multi_context_use" },
      { category: CATEGORIES.PLATFORM.name, delta: 5, reason: "integration_connected" },
      { category: CATEGORIES.GOVERNANCE.name, delta: 10, reason: "governance_proposal" },
      { category: CATEGORIES.GOVERNANCE.name, delta: 5, reason: "community_moderation" },
      { category: CATEGORIES.DEVELOPER.name, delta: 8, reason: "hackathon_submission" },
      { category: CATEGORIES.DEVELOPER.name, delta: 4, reason: "oss_contribution" },
      { category: CATEGORIES.GOVERNANCE.name, delta: 3, reason: "dao_vote" },
      { category: CATEGORIES.PLATFORM.name, delta: 2, reason: "credential_used" },
      { category: CATEGORIES.PLATFORM.name, delta: 1, reason: "credential_used" },
    ];
    const result = computeScoreBreakdown(history);
    expect(result.tier.name).toBe("builder");
  });
});

// ── COMPUTE FROM EVENTS ───────────────────────────────────────────────────────
describe("computeScoreFromEvents", () => {
  it("computes score from event map", () => {
    const result = computeScoreFromEvents({
      identity_minted: 1,
      github_verified: 1,
    });
    expect(result.total).toBe(32);
    expect(result.tier.name).toBe("newcomer");
  });

  it("ignores unknown event keys", () => {
    const result = computeScoreFromEvents({
      identity_minted: 1,
      unknown_event_xyz: 5,
    } as any);
    expect(result.total).toBe(20);
  });

  it("handles multiple occurrences of the same event", () => {
    const result = computeScoreFromEvents({
      dao_vote: 10, // 10 × 3 = 30, but capped at 36
    });
    const governance = result.categories.find(
      (c) => c.name === CATEGORIES.GOVERNANCE.name
    );
    expect(governance?.score).toBe(30);
  });

  it("returns newcomer tier for empty events", () => {
    const result = computeScoreFromEvents({});
    expect(result.total).toBe(0);
    expect(result.tier).toEqual({ level: 0, name: "newcomer" });
  });
});
