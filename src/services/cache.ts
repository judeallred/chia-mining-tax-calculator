import type { CachedData, ApiKeys } from "../types";

const PREFIX = "chiatax:";
const COINS_TTL_CURRENT_YEAR = 60 * 60 * 1000; // 1 hour

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
    if (!k.startsWith(key("coins:"))) continue;
    if (k.includes(`:${cYear}`)) continue;
    const raw = safeGet<CachedData<unknown>>(k);
    if (raw?.fetchedAt) {
      candidates.push({ key: k, fetchedAt: raw.fetchedAt });
    }
  }
  candidates.sort((a, b) => a.fetchedAt - b.fetchedAt);
  for (const c of candidates.slice(0, 3)) {
    localStorage.removeItem(c.key);
  }
}

function isFresh(fetchedAt: number, ttlMs: number, year: number): boolean {
  if (year < currentYear()) return true;
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
  return safeGet<CachedData<unknown[]>>(key(`coins:${puzzleHash}`));
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

export function clearCacheForQuery(puzzleHashes: string[]): void {
  for (const ph of puzzleHashes) {
    localStorage.removeItem(key(`coins:${ph}`));
  }
}
