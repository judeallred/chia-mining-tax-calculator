import * as fs from "node:fs";
import * as path from "node:path";

const OUTPUT_PATH = path.join(import.meta.dirname, "..", "public", "data", "xch-usd-daily.json");

interface PriceMap {
  [dateKey: string]: number;
}

interface CryptoCompareEntry {
  time: number;
  close: number;
}

interface CryptoCompareResponse {
  Response: string;
  Data: { Data: CryptoCompareEntry[] };
}

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString().split("T")[0] ?? "";
}

async function fetchFromCryptoCompare(): Promise<PriceMap> {
  console.log("Fetching from CryptoCompare (histoday, limit=2000)...");
  const url = "https://min-api.cryptocompare.com/data/v2/histoday?fsym=XCH&tsym=USD&limit=2000";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`CryptoCompare error: ${response.status}`);
  }

  const json = (await response.json()) as CryptoCompareResponse;
  if (json.Response !== "Success") {
    throw new Error(`CryptoCompare API returned: ${json.Response}`);
  }

  const prices: PriceMap = {};
  for (const entry of json.Data.Data) {
    if (entry.close > 0) {
      const dateKey = formatDate(entry.time);
      if (dateKey) {
        prices[dateKey] = Math.round(entry.close * 100) / 100;
      }
    }
  }

  console.log(`  Got ${Object.keys(prices).length} daily prices from CryptoCompare`);
  return prices;
}

async function main(): Promise<void> {
  console.log("Updating bundled XCH/USD daily prices...\n");

  const prices = await fetchFromCryptoCompare();

  // Ensure output directory exists
  const dir = path.dirname(OUTPUT_PATH);
  fs.mkdirSync(dir, { recursive: true });

  // Sort by date key
  const sorted: PriceMap = {};
  for (const key of Object.keys(prices).sort()) {
    const value = prices[key];
    if (value !== undefined) {
      sorted[key] = value;
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(sorted, null, 2));
  console.log(`\nWrote ${Object.keys(sorted).length} price entries to ${OUTPUT_PATH}`);
  console.log(`Range: ${Object.keys(sorted)[0]} to ${Object.keys(sorted).at(-1)}`);
}

main().catch(console.error);
