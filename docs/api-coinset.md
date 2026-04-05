# Coinset.org API Integration

## Purpose

Documents how the app fetches Chia blockchain transaction data from coinset.org.

## Key Concepts

- **Endpoint:** `POST https://api.coinset.org/get_coin_records_by_puzzle_hash`
- **Auth:** None required (public API). Optional API key slot reserved for future use.
- **Data model:** Chia uses a UTXO-like "coin set" model. Each coin has a puzzle hash (≈ address), an amount in mojos, and metadata including a `coinbase` boolean.

## File Map

- `src/services/coinset.ts` — API client
- `src/services/fetchWithRetry.ts` — Retry layer used by the client
- `src/services/cache.ts` — Caches raw coin records per puzzle hash

## Data Shapes

### Request Body

```json
{
  "puzzle_hash": "0x<64-char hex>",
  "include_spent_coins": true
}
```

### Response

```json
{
  "success": true,
  "coin_records": [
    {
      "coin": {
        "parent_coin_info": "0x...",
        "puzzle_hash": "0x...",
        "amount": 1750000000000
      },
      "confirmed_block_index": 123456,
      "spent_block_index": 0,
      "spent": false,
      "coinbase": true,
      "timestamp": 1680000000
    }
  ]
}
```

### Key Fields

- `coinbase: true` — This coin was created as a block reward (farming/mining)
- `amount` — In mojos (1 XCH = 1,000,000,000,000 mojos)
- `timestamp` — Unix seconds when the coin was confirmed on-chain
- `include_spent_coins: true` — Required to see historical transactions, not just current balance

## Edge Cases and Gotchas

- Puzzle hash must include the `0x` prefix when sent to the API
- The API returns ALL coins ever received at this puzzle hash (no built-in date filtering) — we filter by timestamp client-side
- Very active wallets may return thousands of records in a single call
- `coinbase: true` only appears on solo farming rewards; pool payouts are regular transactions

## Extension Points

- Add `start_height` / `end_height` params for server-side filtering if the API supports it efficiently
- Could add `get_coin_records_by_parent_ids` to trace coin lineage for better pool payout detection
