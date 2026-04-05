import type { PriceMap, FetchProgress } from "../types";
import { fetchWithRetry } from "./fetchWithRetry";
import { getPrices, isPricesFresh, setPrices } from "./cache";

const DEMO_BASE = "https://api.coingecko.com/api/v3";
const PRO_BASE = "https://pro-api.coingecko.com/api/v3";
const COIN_ID = "chia-network";

function getBaseUrl(apiKey?: string): string {
  if (!apiKey) return DEMO_BASE;
  // Pro keys are longer and start differently than demo keys
  return apiKey.startsWith("CG-") ? PRO_BASE : DEMO_BASE;
}

function getHeaders(apiKey?: string): Record<string, string> {
  if (!apiKey) return {};
  if (apiKey.startsWith("CG-")) {
    return { "x-cg-pro-api-key": apiKey };
  }
  return { "x-cg-demo-api-key": apiKey };
}

async function fetchBundledPrices(): Promise<PriceMap> {
  try {
    const response = await fetch("./data/xch-usd-daily.json");
    if (!response.ok) return {};
    return (await response.json()) as PriceMap;
  } catch {
    return {};
  }
}

interface MarketChartResponse {
  prices: [number, number][];
}

async function fetchPriceRange(
  year: number,
  apiKey?: string,
  onProgress?: (progress: FetchProgress) => void,
): Promise<PriceMap> {
  const from = Math.floor(new Date(`${year}-01-01T00:00:00Z`).getTime() / 1000);
  const to = Math.floor(new Date(`${year}-12-31T23:59:59Z`).getTime() / 1000);
  const base = getBaseUrl(apiKey);
  const headers = getHeaders(apiKey);

  const url = `${base}/coins/${COIN_ID}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;

  const response = await fetchWithRetry(
    url,
    { headers },
    {
      onRetry: (attempt, _error, delayMs) => {
        onProgress?.({
          phase: "prices",
          message: `Retrying price fetch... attempt ${attempt} (waiting ${Math.round(delayMs / 1000)}s)`,
          current: 0,
          total: 1,
          retrying: true,
          retryAttempt: attempt,
        });
      },
    },
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as MarketChartResponse;
  const priceMap: PriceMap = {};

  for (const [timestampMs, price] of json.prices) {
    const date = new Date(timestampMs);
    const dateKey = date.toISOString().split("T")[0]!;
    priceMap[dateKey] = price;
  }

  return priceMap;
}

export async function fetchPricesForYear(
  year: number,
  options?: {
    apiKey?: string;
    forceRefresh?: boolean;
    onProgress?: (progress: FetchProgress) => void;
  },
): Promise<PriceMap> {
  // Check cache
  if (!options?.forceRefresh && isPricesFresh(year)) {
    const cached = getPrices(year);
    if (cached) {
      options?.onProgress?.({
        phase: "prices",
        message: "Price data loaded from cache",
        current: 1,
        total: 1,
        fromCache: true,
      });
      return cached.data;
    }
  }

  options?.onProgress?.({
    phase: "prices",
    message: `Fetching XCH price data for ${year}...`,
    current: 0,
    total: 1,
  });

  let prices: PriceMap = {};

  try {
    prices = await fetchPriceRange(year, options?.apiKey, options?.onProgress);
    options?.onProgress?.({
      phase: "prices",
      message: `Loaded ${Object.keys(prices).length} daily prices from CoinGecko`,
      current: 1,
      total: 1,
    });
  } catch {
    // Fall back to bundled data
    options?.onProgress?.({
      phase: "prices",
      message: "CoinGecko API unavailable, using bundled price data...",
      current: 0,
      total: 1,
    });

    const bundled = await fetchBundledPrices();
    // Filter to requested year
    for (const [dateKey, price] of Object.entries(bundled)) {
      if (dateKey.startsWith(String(year))) {
        prices[dateKey] = price;
      }
    }

    options?.onProgress?.({
      phase: "prices",
      message: `Loaded ${Object.keys(prices).length} daily prices from bundled data`,
      current: 1,
      total: 1,
    });
  }

  // Merge with bundled for any missing dates
  const bundled = await fetchBundledPrices();
  for (const [dateKey, price] of Object.entries(bundled)) {
    if (dateKey.startsWith(String(year)) && !prices[dateKey]) {
      prices[dateKey] = price;
    }
  }

  setPrices(year, prices);
  return prices;
}

export function lookupPrice(prices: PriceMap, date: Date): number | null {
  const dateKey = date.toISOString().split("T")[0]!;
  const price = prices[dateKey];
  if (price !== undefined) return price;

  // Try adjacent days (price data may have gaps)
  for (let offset = 1; offset <= 3; offset++) {
    const before = new Date(date);
    before.setDate(before.getDate() - offset);
    const beforeKey = before.toISOString().split("T")[0]!;
    if (prices[beforeKey] !== undefined) return prices[beforeKey]!;

    const after = new Date(date);
    after.setDate(after.getDate() + offset);
    const afterKey = after.toISOString().split("T")[0]!;
    if (prices[afterKey] !== undefined) return prices[afterKey]!;
  }

  return null;
}
