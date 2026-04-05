import * as fs from "node:fs";
import * as path from "node:path";

const COIN_ID = "chia-network";
const BASE_URL = "https://api.coingecko.com/api/v3";
const OUTPUT_PATH = path.join(import.meta.dirname, "..", "public", "data", "xch-usd-daily.json");
const XCH_LAUNCH = new Date("2021-05-04");

interface PriceMap {
  [dateKey: string]: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchYearPrices(year: number): Promise<PriceMap> {
  const from = Math.max(
    Math.floor(new Date(`${year}-01-01T00:00:00Z`).getTime() / 1000),
    Math.floor(XCH_LAUNCH.getTime() / 1000),
  );
  const to = Math.min(
    Math.floor(new Date(`${year}-12-31T23:59:59Z`).getTime() / 1000),
    Math.floor(Date.now() / 1000),
  );

  if (from >= to) return {};

  const url = `${BASE_URL}/coins/${COIN_ID}/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;
  console.log(`  Fetching ${year}: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`  Error fetching ${year}: ${response.status} ${response.statusText}`);
    return {};
  }

  const json = (await response.json()) as { prices: [number, number][] };
  const prices: PriceMap = {};

  for (const [timestampMs, price] of json.prices) {
    const date = new Date(timestampMs);
    const dateKey = date.toISOString().split("T")[0]!;
    prices[dateKey] = Math.round(price * 100) / 100;
  }

  console.log(`  Got ${Object.keys(prices).length} daily prices for ${year}`);
  return prices;
}

async function main(): Promise<void> {
  console.log("Updating bundled XCH/USD daily prices...\n");

  const currentYear = new Date().getFullYear();
  const allPrices: PriceMap = {};

  for (let year = 2021; year <= currentYear; year++) {
    const yearPrices = await fetchYearPrices(year);
    Object.assign(allPrices, yearPrices);
    if (year < currentYear) {
      console.log("  Waiting 2s for rate limit...");
      await sleep(2000);
    }
  }

  // Ensure output directory exists
  const dir = path.dirname(OUTPUT_PATH);
  fs.mkdirSync(dir, { recursive: true });

  // Sort by date key
  const sorted: PriceMap = {};
  for (const key of Object.keys(allPrices).sort()) {
    sorted[key] = allPrices[key]!;
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(sorted, null, 2));
  console.log(`\nWrote ${Object.keys(sorted).length} price entries to ${OUTPUT_PATH}`);
}

main().catch(console.error);
