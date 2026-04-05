# CoinGecko API Integration

## Purpose

Documents how the app fetches historical XCH/USD price data from CoinGecko for cost basis calculations.

## Key Concepts

- **Primary endpoint:** `GET /coins/chia-network/market_chart/range?vs_currency=usd&from=UNIX&to=UNIX`
- **Coin ID:** `chia-network`
- **Free tier (demo):** ~30 requests/min, historical data limited to past 365 days
- **Pro tier:** Higher limits, full historical access
- **Bundled fallback:** `public/data/xch-usd-daily.json` provides offline/historical coverage

## File Map

- `src/services/coingecko.ts` — API client with key detection and fallback
- `scripts/update-prices.ts` — Generates the bundled price JSON
- `public/data/xch-usd-daily.json` — Bundled daily prices (YYYY-MM-DD → USD)

## Data Shapes

### API Response (market_chart/range)

```json
{
  "prices": [[1680000000000, 32.45], [1680086400000, 33.12], ...]
}
```

Each entry is `[timestamp_ms, price_usd]`. For ranges >90 days, data is daily at 00:00 UTC.

### Bundled Price JSON

```json
{
  "2023-01-01": 29.45,
  "2023-01-02": 30.12,
  ...
}
```

### Internal PriceMap

```typescript
type PriceMap = Record<string, number>; // "YYYY-MM-DD" → USD
```

## Key Detection

The service auto-detects the key type:
- No key → public API (`https://api.coingecko.com/api/v3/`)
- Key starting with `CG-` → Pro API (`https://pro-api.coingecko.com/api/v3/`, header: `x-cg-pro-api-key`)
- Other keys → Demo API (same base URL, header: `x-cg-demo-api-key`)

## Price Lookup Strategy

1. Look up exact date in PriceMap
2. If missing, search ±3 adjacent days
3. Return `null` if no price found

## Edge Cases and Gotchas

- Free tier 365-day limit means 2024 tax year data is unavailable via API in late 2025
- The bundled JSON fills this gap but may be stale if not regenerated
- Price data gaps can occur on dates with low trading volume
- CoinGecko returns daily data at 00:00 UTC; transactions at other times use that day's price

## Extension Points

- Add alternative price sources (e.g., CoinMarketCap, direct exchange APIs)
- Add hourly price resolution using the `interval=hourly` param (paid tier)
- Regenerate bundled prices in CI on a schedule
