# Caching Strategy

## Purpose

Documents the localStorage-based caching layer that persists user state and API responses across page reloads.

## Key Concepts

- All cache keys are prefixed with `chiatax:`
- Data caches include a `fetchedAt` timestamp for TTL calculations
- Past tax years are considered immutable (never stale)
- Current year data has TTLs to balance freshness vs API load

## File Map

- `src/services/cache.ts` — All cache read/write/evict logic

## Data Shapes

### Cache Key Schema

| Key Pattern | Value Type | TTL (current year) | TTL (past year) |
|---|---|---|---|
| `chiatax:addresses` | `string[]` | N/A (user pref) | N/A |
| `chiatax:taxYear` | `number` | N/A (user pref) | N/A |
| `chiatax:apiKeys` | `ApiKeys` | N/A (user pref) | N/A |
| `chiatax:miningOverrides` | `Record<string, boolean>` | N/A (user pref) | N/A |
| `chiatax:coins:<puzzleHash>` | `CachedData<RawCoinRecord[]>` | 1 hour | Never stale |
| `chiatax:prices:<year>` | `CachedData<Record<string, number>>` | 24 hours | Never stale |

### CachedData Wrapper

```typescript
interface CachedData<T> {
  data: T;
  fetchedAt: number; // Date.now() at write time
}
```

## TTL Rules

- **Coin records (current year):** 1 hour — new blocks may add transactions
- **Coin records (past years):** Never stale — blockchain is immutable
- **Prices (current year):** 24 hours — prices settle daily
- **Prices (past years):** Never stale — historical prices don't change

## Eviction on QuotaExceededError

localStorage typically has a 5-10 MB quota. When a write fails:

1. Collect all `chiatax:coins:*` and `chiatax:prices:*` keys
2. Exclude entries for the current year
3. Sort by `fetchedAt` ascending (oldest first)
4. Delete the 3 oldest entries
5. Retry the write

## Edge Cases and Gotchas

- User preferences (addresses, tax year, API keys, overrides) are never evicted
- The cache module silently swallows parse errors for corrupted entries
- `clearCacheForQuery()` is called when the user clicks "Refresh Data"
- Each puzzle hash gets its own cache entry (avoids one large wallet crowding out others)

## Extension Points

- Add IndexedDB support for larger storage capacity
- Add cache size reporting in the UI
- Add per-entry TTL overrides
