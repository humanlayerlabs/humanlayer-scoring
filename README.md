# @humanlayerlabs/scoring

The open source scoring algorithm powering [HumanLayer Protocol](https://humanlayer.network) — a soulbound identity protocol on Base L2.

This package is a pure TypeScript library with **no database dependencies**. Pass in a history of score events, get back a total score, tier, and category breakdown.

---

## How scoring works

Every verified human starts at 0. Actions across four categories accumulate points up to a maximum of **144**. Each category has a cap of 36 points to ensure a balanced reputation profile.

### Categories

| Category                  | Max points |
|---------------------------|-----------|
| Verification Completeness | 36        |
| Developer Contributions   | 36        |
| Community Governance      | 36        |
| Platform Usage            | 36        |
| **Total**                 | **144**   |

### Score events

| Event                  | Category                  | Points |
|------------------------|---------------------------|--------|
| `identity_minted`      | Verification Completeness | +20    |
| `github_verified`      | Developer Contributions   | +12    |
| `hackathon_submission` | Developer Contributions   | +8     |
| `multi_context_use`    | Platform Usage            | +8     |
| `governance_proposal`  | Community Governance      | +10    |
| `community_moderation` | Community Governance      | +5     |
| `integration_connected`| Platform Usage            | +5     |
| `stake_created`        | Verification Completeness | +4     |
| `oss_contribution`     | Developer Contributions   | +4     |
| `dao_vote`             | Community Governance      | +3     |
| `credential_used`      | Platform Usage            | +2     |
| `stake_withdrawn`      | Verification Completeness | −4     |
| `slashed`              | Verification Completeness | −36    |

### Tiers

| Score range | Level | Tier name  |
|-------------|-------|------------|
| 130 – 144   |   4   | core       |
| 100 – 129   |   3   | elite      |
|  60 – 99    |   2   | builder    |
|  40 – 59    |   1   | verified   |
|   0 – 39    |   0   | newcomer   |

---

## Installation

```bash
npm install @humanlayerlabs/scoring
```

---

## Usage

### Compute a score from history entries

```typescript
import { computeScoreBreakdown } from "@humanlayerlabs/scoring";

const history = [
  { category: "Verification Completeness", delta: 20, reason: "identity_minted" },
  { category: "Developer Contributions",   delta: 12, reason: "github_verified" },
  { category: "Community Governance",      delta: 10, reason: "governance_proposal" },
  { category: "Community Governance",      delta:  3, reason: "dao_vote" },
];

const result = computeScoreBreakdown(history);

console.log(result.total);        // 45
console.log(result.tier.name);    // "verified"
console.log(result.tier.level);   // 1
console.log(result.categories);
// [
//   { name: "Verification Completeness", score: 20, max: 36, percentage: 56 },
//   { name: "Developer Contributions",   score: 12, max: 36, percentage: 33 },
//   { name: "Community Governance",      score: 13, max: 36, percentage: 36 },
//   { name: "Platform Usage",            score:  0, max: 36, percentage:  0 },
// ]
```

### Compute a score from event counts

```typescript
import { computeScoreFromEvents } from "@humanlayerlabs/scoring";

const result = computeScoreFromEvents({
  identity_minted: 1,
  github_verified: 1,
  dao_vote: 5,
  governance_proposal: 1,
});

console.log(result.total);      // 57
console.log(result.tier.name);  // "verified"
```

### Tier utilities

```typescript
import { getTier, getTierLevel, getTierName } from "@humanlayerlabs/scoring";

getTier(82);       // { level: 2, name: "builder" }
getTierLevel(144); // 4
getTierName(130);  // "core"
```

### Apply a single delta

```typescript
import { applyDelta } from "@humanlayerlabs/scoring";

applyDelta(130, 20);  // 144 (clamped at max)
applyDelta(10, -36);  // 0   (clamped at 0)
```

---

## API reference

### `computeScoreBreakdown(history: ScoreHistoryEntry[]): ScoreBreakdown`

Computes a full score breakdown from an array of score history entries. Pure function — no side effects.

### `computeScoreFromEvents(events: Partial<Record<string, number>>): ScoreBreakdown`

Computes a score from a map of event keys to occurrence counts.

### `getTier(score: number): { level: TierLevel; name: string }`

Returns the tier level and name for a given score.

### `getTierLevel(score: number): TierLevel`

Returns the numeric tier level (0–4).

### `getTierName(score: number): string`

Returns the tier name string.

### `applyDelta(currentScore: number, delta: number): number`

Applies a delta to a score and clamps between 0 and 144.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-change`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Open a pull request

All scoring changes must include updated tests. Tier threshold changes require discussion in an issue first.

---

## Links

- Website: [humanlayer.network](https://humanlayer.network)
- Twitter: [@HumanLayerlabs](https://twitter.com/HumanLayerlabs)
- Discord: [discord.gg/vcfAMaWz6W](https://discord.gg/vcfAMaWz6W)
- Email: [founders@humanlayer.network](mailto:founders@humanlayer.network)
- Contract (Base Mainnet): [`0x6E5F0D5cCF7b42807b122D8D833A31132a57A29f`](https://basescan.org/address/0x6E5F0D5cCF7b42807b122D8D833A31132a57A29f)

---

## License

MIT © [HumanLayer Labs](https://humanlayer.network)
