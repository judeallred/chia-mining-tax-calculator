import type { RawCoinRecord, FetchProgress } from "../types";
import { fetchWithRetry } from "./fetchWithRetry";
import { getCoinRecords, isCoinRecordsFresh, setCoinRecords } from "./cache";

const BASE_URL = "https://api.coinset.org";

interface CoinsetResponse {
  coin_records: RawCoinRecord[];
  success: boolean;
  error?: string;
}

export async function fetchCoinRecordsByPuzzleHash(
  puzzleHash: string,
  options?: {
    apiKey?: string;
    forceRefresh?: boolean;
    taxYear?: number;
    onProgress?: (progress: FetchProgress) => void;
  },
): Promise<RawCoinRecord[]> {
  const year = options?.taxYear ?? new Date().getFullYear();

  // Check cache
  if (!options?.forceRefresh && isCoinRecordsFresh(puzzleHash, year)) {
    const cached = getCoinRecords(puzzleHash);
    if (cached) {
      options?.onProgress?.({
        phase: "transactions",
        message: "Loaded from cache",
        current: 1,
        total: 1,
        fromCache: true,
      });
      return cached.data as RawCoinRecord[];
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options?.apiKey) {
    headers["x-api-key"] = options.apiKey;
  }

  const body = JSON.stringify({
    puzzle_hash: `0x${puzzleHash}`,
    include_spent_coins: true,
  });

  const response = await fetchWithRetry(
    `${BASE_URL}/get_coin_records_by_puzzle_hash`,
    { method: "POST", headers, body },
    {
      onRetry: (attempt, _error, delayMs) => {
        options?.onProgress?.({
          phase: "transactions",
          message: `Retrying... attempt ${attempt} (waiting ${Math.round(delayMs / 1000)}s)`,
          current: 0,
          total: 1,
          retrying: true,
          retryAttempt: attempt,
        });
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Coinset API error: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as CoinsetResponse;
  if (!json.success) {
    throw new Error(`Coinset API error: ${json.error ?? "Unknown error"}`);
  }

  const records = json.coin_records;
  setCoinRecords(puzzleHash, records);
  return records;
}

export async function fetchAllAddresses(
  puzzleHashes: { puzzleHash: string; address: string }[],
  options?: {
    apiKey?: string;
    forceRefresh?: boolean;
    taxYear?: number;
    onProgress?: (progress: FetchProgress) => void;
  },
): Promise<{ records: RawCoinRecord[]; address: string }[]> {
  const results: { records: RawCoinRecord[]; address: string }[] = [];

  for (let i = 0; i < puzzleHashes.length; i++) {
    const entry = puzzleHashes[i]!;
    options?.onProgress?.({
      phase: "transactions",
      message: `Fetching transactions for address ${i + 1} of ${puzzleHashes.length}...`,
      current: i,
      total: puzzleHashes.length,
    });

    const records = await fetchCoinRecordsByPuzzleHash(entry.puzzleHash, {
      apiKey: options?.apiKey,
      forceRefresh: options?.forceRefresh,
      taxYear: options?.taxYear,
      onProgress: options?.onProgress,
    });

    results.push({ records, address: entry.address });

    options?.onProgress?.({
      phase: "transactions",
      message: `Fetched ${records.length} records for address ${i + 1}`,
      current: i + 1,
      total: puzzleHashes.length,
    });
  }

  return results;
}
