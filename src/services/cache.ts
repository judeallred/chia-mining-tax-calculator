import type { CachedData, ApiKeys } from "../types";

const PREFIX = "chiatax:";
const COINS_TTL_CURRENT_YEAR = 60 * 60 * 1000; // 1 hour
const PRICES_TTL_CURRENT_YEAR = 24 * 60 * 60 * 1000; // 24 hours

function key(suffix: string): string {
  return `${PREFIX}${suffix}`;
}

function currentYear(): number {
  return new Date().getFullYear();
}

function safeGet<T>(k: string): T | null {
  try {
    const raw = localStorage.getItem(k);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeSet(k: string, value: unknown): void {
  const json = JSON.stringify(value);
  try {
    localStorage.setItem(k, json);
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      evictOldest();
      try {
        localStorage.setItem(k, json);
      } catch {
        // give up silently
      }
    }
  }
}

function evictOldest(): void {
  const cYear = currentYear();
  const candidates: { key: string; fetchedAt: number }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k?.startsWith(PREFIX)) continue;
    // Only evict data caches, not user preferences
    if (!k.startsWith(key("coins:")) && !k.startsWith(key("prices:"))) continue;
    // Don't evict current year data
    if (k.includes(`:${cYear}`)) continue;
    const raw = safeGet<CachedData<unknown>>(k);
    if (raw?.fetchedAt) {
      candidates.push({ key: k, fetchedAt: raw.fetchedAt });
    }
  }
  candidates.sort((a, b) => a.fetchedAt - b.fetchedAt);
  // Evict oldest 3 entries
  for (const c of candidates.slice(0, 3)) {
    localStorage.removeItem(c.key);
  }
}

function isFresh(fetchedAt: number, ttlMs: number, year: number): boolean {
  if (year < currentYear()) return true; // past years never stale
  return Date.now() - fetchedAt < ttlMs;
}

// --- Public API ---

export function getAddresses(): string[] {
  return safeGet<string[]>(key("addresses")) ?? [];
}

export function setAddresses(addresses: string[]): void {
  safeSet(key("addresses"), addresses);
}

export function getTaxYear(): number | null {
  return safeGet<number>(key("taxYear"));
}

export function setTaxYear(year: number): void {
  safeSet(key("taxYear"), year);
}

export function getApiKeys(): ApiKeys {
  return safeGet<ApiKeys>(key("apiKeys")) ?? {};
}

export function setApiKeys(keys: ApiKeys): void {
  safeSet(key("apiKeys"), keys);
}

export function getMiningOverrides(): Record<string, boolean> {
  return safeGet<Record<string, boolean>>(key("miningOverrides")) ?? {};
}

export function setMiningOverrides(overrides: Record<string, boolean>): void {
  safeSet(key("miningOverrides"), overrides);
}

export function getCoinRecords(puzzleHash: string): CachedData<unknown[]> | null {
  const cached = safeGet<CachedData<unknown[]>>(key(`coins:${puzzleHash}`));
  if (!cached) return null;
  return cached;
}

export function isCoinRecordsFresh(puzzleHash: string, year: number): boolean {
  const cached = getCoinRecords(puzzleHash);
  if (!cached) return false;
  return isFresh(cached.fetchedAt, COINS_TTL_CURRENT_YEAR, year);
}

export function setCoinRecords(puzzleHash: string, data: unknown[]): void {
  const entry: CachedData<unknown[]> = { data, fetchedAt: Date.now() };
  safeSet(key(`coins:${puzzleHash}`), entry);
}

export function getPrices(year: number): CachedData<Record<string, number>> | null {
  const cached = safeGet<CachedData<Record<string, number>>>(key(`prices:${year}`));
  if (!cached) return null;
  return cached;
}

export function isPricesFresh(year: number): boolean {
  const cached = getPrices(year);
  if (!cached) return false;
  return isFresh(cached.fetchedAt, PRICES_TTL_CURRENT_YEAR, year);
}

export function setPrices(year: number, data: Record<string, number>): void {
  const entry: CachedData<Record<string, number>> = { data, fetchedAt: Date.now() };
  safeSet(key(`prices:${year}`), entry);
}

export function clearCacheForQuery(puzzleHashes: string[], year: number): void {
  for (const ph of puzzleHashes) {
    localStorage.removeItem(key(`coins:${ph}`));
  }
  localStorage.removeItem(key(`prices:${year}`));
}
