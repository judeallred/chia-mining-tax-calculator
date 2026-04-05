# Price Data Integration

## Purpose

Documents how the app obtains historical XCH/USD price data for cost basis calculations.

## Key Concepts

- **No runtime API calls.** All price data is bundled as a static JSON file shipped with the app.
- **Data source:** CryptoCompare `histoday` API, fetched once at build time by `scripts/update-prices.ts`
- **Format:** `public/data/xch-usd-daily.json` — a flat `{ "YYYY-MM-DD": price }` map
- **Coverage:** ~1,700+ daily closing prices from June 2021 (XCH exchange launch) to the date the script was last run
- **Update process:** Re-run `npm run update-prices` and redeploy to refresh price data

## File Map

- `scripts/update-prices.ts` — Fetches daily closing prices from CryptoCompare and writes the bundled JSON
- `public/data/xch-usd-daily.json` — Static bundled price data (~39 KB)
- `src/services/coingecko.ts` — Loads the bundled JSON at runtime and provides `lookupPrice()` for date-based lookups

## Data Shapes

### Bundled Price JSON

```json
{
  "2021-07-01": 281.63,
  "2021-07-02": 270.05,
  ...
  "2026-04-05": 2.49
}
```

### CryptoCompare API Response (used by build script only)

```
GET https://min-api.cryptocompare.com/data/v2/histoday?fsym=XCH&tsym=USD&limit=2000
```

Returns up to 2000 daily OHLCV entries. The script uses the `close` price.

### lookupPrice()

```typescript
function lookupPrice(prices: PriceMap, date: Date): number | null
```

1. Looks up the exact date (`YYYY-MM-DD`) in the price map
2. If missing, searches ±3 adjacent days for the nearest available price
3. Returns `null` if no price found within range

## Edge Cases and Gotchas

- XCH launched on exchanges around May 2021, but CryptoCompare data starts June 30, 2021. Early May transactions may lack prices.
- The bundled data becomes stale as time passes — re-run the script periodically (could be automated in CI)
- CryptoCompare uses daily closing prices (00:00 UTC); intraday price variations are not captured
- Price data gaps are handled by the ±3 day lookback in `lookupPrice()`
- The bundled JSON is ~39 KB and loaded once on first use (cached in memory)

## Extension Points

- Automate price updates via a scheduled GitHub Action (`cron` trigger that runs `update-prices` and commits)
- Add CoinGecko as a secondary data source for cross-validation
- Add support for user-uploaded price CSV as override
- Add hourly or intraday price resolution
