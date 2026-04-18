# @humanlayerlabs/scoring

The open source scoring algorithm powering [HumanLayer Protocol](https://humanlayer.network) — a soulbound identity protocol on Base L2.

This package is a pure TypeScript library with **no database dependencies**. Pass in a history of score events, get back a total score, tier, and category breakdown.

> **This is v1 of the algorithm.** Weights and categories will evolve based on real-world data and community input. We are already working on multi-source attestations and ZK proof integration for v2. See the [roadmap](#roadmap) below.

---

## Why we open sourced this

Identity and reputation infrastructure should not be a black box. If apps and users are going to trust a score, they should be able to verify exactly how it was computed — not just read a number from an API.

Open sourcing the scoring algorithm means:
- Anyone can audit the weights and suggest improvements
- The community can contribute new signal types
- ZK proof integration becomes meaningful (apps can verify the computation, not just the output)
- No hidden bias — every point is accounted for

The algorithm will evolve. We are committed to doing that in public.

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

## Roadmap

This is v1. Here's what's coming in v2 (targeted for the next 2–4 months):

**New verification signals**
- **LinkedIn OAuth** — professional identity and work history as a high-confidence signal
- **Farcaster attestations** — on-chain social graph and engagement signals
- **POAP + ENS signals** — event participation and long-term name ownership
- **Additional Web2/Web3 signals** *(under exploration: Discord, X/Twitter verified, Gitcoin Passport stamps)*

**Core algorithm upgrades**
- **Full ZK proofs for score derivation** — apps can independently verify a score was computed correctly, not just trust the output (via [zkVerify](https://zkverify.io) integration)
- **Score decay mechanism** — inactive or low-activity identities gradually lose score to reflect current behavior
- **Advanced multi-source weighting** — dynamic and adaptive weights based on real-world performance, gaming attempts, and community input
- **Input pipeline attestations** — ZK proofs for individual data sources where possible

**Ecosystem & composability**
- **Revocation / challenge mechanism** — community or app-level ability to flag and dispute suspicious identities
- **Composable credentials / selective disclosure** — share specific score attributes (e.g. "Developer Tier > 80" or "Active since 2024") without revealing the full score
- **Developer SDK v2** — easier integration tools with examples for DAOs, airdrop platforms, and social apps
- **Cross-chain expansion** — support for Optimism, Arbitrum, and other L2s
- **On-chain governance for parameter tuning** — DAO-based voting to adjust weights and add new signals

**Community-driven:** Have a signal or feature you think should be included? [Open an issue](https://github.com/humanlayerlabs/humanlayer-scoring/issues) — top suggestions will be prioritized.

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
- Email: [founders@humanlayer.network](mailto:info@humanlayer.network)
- Contract (Base Mainnet): [`0x6E5F0D5cCF7b42807b122D8D833A31132a57A29f`](https://basescan.org/address/0x6E5F0D5cCF7b42807b122D8D833A31132a57A29f)

---

## License

MIT © [HumanLayer Labs](https://humanlayer.network)
