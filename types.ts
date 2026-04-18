// ── TIER LEVELS ───────────────────────────────────────────────────────────────
export type TierLevel = 0 | 1 | 2 | 3 | 4;

export const TIER_NAMES: Record<TierLevel, string> = {
  0: "newcomer",
  1: "verified",
  2: "builder",
  3: "elite",
  4: "core",
};

export const TIER_THRESHOLDS: Record<TierLevel, number> = {
  0: 0,
  1: 40,
  2: 60,
  3: 100,
  4: 130,
};

// ── SCORE CATEGORIES ──────────────────────────────────────────────────────────
export interface ScoreCategory {
  name: string;
  max: number;
}

export const CATEGORIES: Record<string, ScoreCategory> = {
  DEVELOPER: { name: "Developer Contributions", max: 36 },
  GOVERNANCE: { name: "Community Governance", max: 36 },
  PLATFORM: { name: "Platform Usage", max: 36 },
  VERIFICATION: { name: "Verification Completeness", max: 36 },
};

export const MAX_TOTAL_SCORE = 144;

// ── SCORE EVENTS ──────────────────────────────────────────────────────────────
export interface ScoreEvent {
  category: string;
  delta: number;
  description: string;
}

export const SCORE_EVENTS: Record<string, ScoreEvent> = {
  // Verification
  identity_minted: {
    category: CATEGORIES.VERIFICATION.name,
    delta: 20,
    description: "Minted a verified soulbound identity NFT",
  },
  stake_created: {
    category: CATEGORIES.VERIFICATION.name,
    delta: 4,
    description: "Created an identity stake",
  },
  stake_withdrawn: {
    category: CATEGORIES.VERIFICATION.name,
    delta: -4,
    description: "Withdrew an identity stake",
  },
  slashed: {
    category: CATEGORIES.VERIFICATION.name,
    delta: -36,
    description: "Identity was slashed for violation",
  },

  // Developer
  github_verified: {
    category: CATEGORIES.DEVELOPER.name,
    delta: 12,
    description: "Connected and verified a GitHub account",
  },
  hackathon_submission: {
    category: CATEGORIES.DEVELOPER.name,
    delta: 8,
    description: "Submitted a project to a hackathon",
  },
  oss_contribution: {
    category: CATEGORIES.DEVELOPER.name,
    delta: 4,
    description: "Made an open source contribution",
  },

  // Governance
  governance_proposal: {
    category: CATEGORIES.GOVERNANCE.name,
    delta: 10,
    description: "Created a governance proposal",
  },
  community_moderation: {
    category: CATEGORIES.GOVERNANCE.name,
    delta: 5,
    description: "Performed a community moderation action",
  },
  dao_vote: {
    category: CATEGORIES.GOVERNANCE.name,
    delta: 3,
    description: "Voted in a DAO governance decision",
  },

  // Platform
  multi_context_use: {
    category: CATEGORIES.PLATFORM.name,
    delta: 8,
    description: "Used credentials across multiple contexts",
  },
  integration_connected: {
    category: CATEGORIES.PLATFORM.name,
    delta: 5,
    description: "Connected an external integration",
  },
  credential_used: {
    category: CATEGORIES.PLATFORM.name,
    delta: 2,
    description: "Used a verified credential",
  },
};

// ── SCORE HISTORY ENTRY ───────────────────────────────────────────────────────
export interface ScoreHistoryEntry {
  category: string;
  delta: number;
  reason: string;
  createdAt?: Date;
}

// ── SCORE BREAKDOWN ───────────────────────────────────────────────────────────
export interface CategoryBreakdown {
  name: string;
  score: number;
  max: number;
  percentage: number;
}

export interface ScoreBreakdown {
  total: number;
  tier: {
    level: TierLevel;
    name: string;
  };
  categories: CategoryBreakdown[];
}
