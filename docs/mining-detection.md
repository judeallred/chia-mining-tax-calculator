# Mining Detection

## Purpose

Documents how transactions are classified as mining/farming income versus regular received funds.

## Key Concepts

Classification uses a three-tier system:

### Tier 1: Block Reward Flag (Certain)

The coinset.org API returns a `coinbase: boolean` flag on each coin record (this is blockchain terminology, unrelated to the company "Coinbase"). When `true`, the coin was created as a block reward — this is definitively a solo farming reward.

### Tier 2: Pool Payout Heuristics (Estimated)

Pool payouts appear as regular transactions (without the block reward flag). The engine uses these heuristics:
- **Known reward amounts:** Matches against expected reward amounts per halving era
- **Small amount heuristic:** Amounts < 0.5 XCH that aren't exact reward amounts are flagged as likely pool payouts

### Tier 3: Manual Override

Users can toggle the "Mining Income" checkbox on any transaction. Overrides are stored in localStorage under `chiatax:miningOverrides`.

## Chia Reward Schedule

| Era | Dates | Block Reward | Farmer (1/8) | Pool (7/8) |
|-----|-------|-------------|--------------|------------|
| 1 | May 2021 – Mar 2024 | 2 XCH | 0.25 XCH | 1.75 XCH |
| 2 | Mar 2024 – Mar 2027 | 1 XCH | 0.125 XCH | 0.875 XCH |
| 3 | Mar 2027 – Mar 2030 | 0.5 XCH | 0.0625 XCH | 0.4375 XCH |
| 4+ | Mar 2030+ | 0.25 XCH | 0.03125 XCH | 0.21875 XCH |

## File Map

- `src/utils/mining.ts` — `processRecords()` function and detection logic
- `src/services/cache.ts` — `getMiningOverrides()` / `setMiningOverrides()`

## Data Shapes

```typescript
type TransactionType = "farming_reward" | "pool_payout" | "received";

interface Transaction {
  type: TransactionType;
  isMiningIncome: boolean;  // final classification (after overrides)
  coinbase: boolean;        // block reward flag from API (not the company)
  // ... other fields
}
```

## Edge Cases and Gotchas

- Pool payouts vary in size — small pools may send irregular amounts
- Fees collected by the farmer are added to the block reward, making the amount slightly larger than expected
- The heuristic for <0.5 XCH may produce false positives for non-mining transfers
- Users should review the auto-classification before exporting for taxes

## Extension Points

- Add known pool address detection (check `parent_coin_info` against a list of pool puzzle hashes)
- Add frequency analysis (regular payments from the same source suggest pool payouts)
- Make the small-amount threshold configurable
- Add a "Classify All" / "Unclassify All" bulk action
