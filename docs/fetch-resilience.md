# Fetch Resilience

## Purpose

Documents the shared retry/backoff/timeout layer used by all API clients.

## Key Concepts

- All HTTP requests go through `fetchWithRetry()`
- Exponential backoff with jitter prevents thundering herd on retries
- Rate limit (429) responses are handled gracefully
- Progress callbacks allow the UI to show retry state

## File Map

- `src/services/fetchWithRetry.ts` — Core retry function
- `src/services/coinset.ts` — Uses fetchWithRetry for blockchain queries
- `src/services/coingecko.ts` — Uses fetchWithRetry for price queries

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `maxAttempts` | 5 | Total number of attempts |
| `baseDelayMs` | 1000 | Base delay for exponential backoff |
| `timeoutMs` | 30000 | Per-request timeout (abort after) |

## Backoff Schedule

```
Attempt 1: fail → wait 1s + jitter
Attempt 2: fail → wait 2s + jitter
Attempt 3: fail → wait 4s + jitter
Attempt 4: fail → wait 8s + jitter
Attempt 5: fail → throw
```

Jitter formula: `delay = baseMs * 2^attempt + random(0, baseMs * 2^attempt * 0.5)`

## Retry Triggers

- **Network errors** (fetch throws) — always retry
- **Timeout** (AbortController fires) — always retry
- **429 Too Many Requests** — retry after `Retry-After` header (seconds) or backoff schedule
- **5xx Server Errors** — retry with backoff
- **4xx Client Errors (except 429)** — NOT retried (return response as-is)

## Data Shapes

### Progress callback / RetryOptions

```typescript
interface RetryOptions {
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
}
```

Services translate this into `FetchProgress` updates that the UI displays.

## Edge Cases and Gotchas

- The abort controller timeout includes network latency + server processing time
- Jitter is additive (delay is always ≥ the exponential base)
- All attempts exhausted throws the last error encountered
- The caller is responsible for checking `response.ok` for non-retried errors

## Extension Points

- Add circuit breaker pattern for sustained failures
- Add request deduplication (prevent identical concurrent requests)
- Add configurable retry predicate for custom retry logic
- Add request/response logging for debugging
