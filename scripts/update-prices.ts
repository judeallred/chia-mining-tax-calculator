import * as fs from "node:fs";
import * as path from "node:path";

const OUTPUT_PATH = path.join(import.meta.dirname, "..", "public", "data", "xch-usd-daily.json");
const FULL_HISTORY_LIMIT = 2000;
const BUFFER_DAYS = 3;

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

function todayUTC(): string {
  return new Date().toISOString().split("T")[0] ?? "";
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000;
  return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

function loadExisting(): PriceMap {
  try {
    if (fs.existsSync(OUTPUT_PATH)) {
      return JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8")) as PriceMap;
    }
  } catch {
    console.log("  Could not parse existing file, will do full fetch");
  }
  return {};
}

async function fetchFromCryptoCompare(limit: number): Promise<PriceMap> {
  console.log(`Fetching from CryptoCompare (histoday, limit=${limit})...`);
  const url = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=XCH&tsym=USD&limit=${limit}`;
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

  console.log(`  Got ${Object.keys(prices).length} daily prices`);
  return prices;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function sortedPriceMap(prices: PriceMap): PriceMap {
  const sorted: PriceMap = {};
  for (const key of Object.keys(prices).sort()) {
    const value = prices[key];
    if (value !== undefined) {
      sorted[key] = value;
    }
  }
  return sorted;
}

function validate(prices: PriceMap, previousCount: number): void {
  const entries = Object.entries(prices);

  if (entries.length === 0) {
    throw new Error("Validation failed: price map is empty");
  }

  if (entries.length < previousCount) {
    throw new Error(
      `Validation failed: merged data has ${entries.length} entries, ` +
      `fewer than the existing ${previousCount} (data loss detected)`,
    );
  }

  for (const [key, value] of entries) {
    if (!DATE_RE.test(key)) {
      throw new Error(`Validation failed: invalid date key "${key}"`);
    }
    if (typeof value !== "number" || !isFinite(value) || value <= 0) {
      throw new Error(`Validation failed: invalid price ${value} for ${key}`);
    }
  }

  const json = JSON.stringify(prices, null, 2);
  JSON.parse(json);
}

async function main(): Promise<void> {
  console.log("Updating bundled XCH/USD daily prices...\n");

  const existing = loadExisting();
  const existingDates = Object.keys(existing).sort();
  const latestDate = existingDates.at(-1);
  const today = todayUTC();

  let limit = FULL_HISTORY_LIMIT;
  if (latestDate) {
    const missing = daysBetween(latestDate, today);
    if (missing <= 0) {
      console.log(`Already up to date (latest: ${latestDate})`);
      return;
    }
    limit = missing + BUFFER_DAYS;
    console.log(`Existing data through ${latestDate}, fetching ${limit} days to catch up\n`);
  } else {
    console.log("No existing data found, fetching full history\n");
  }

  const fetched = await fetchFromCryptoCompare(limit);
  const merged = { ...existing, ...fetched };
  const sorted = sortedPriceMap(merged);

  validate(sorted, existingDates.length);
  console.log("Validation passed");

  const dir = path.dirname(OUTPUT_PATH);
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(sorted, null, 2));

  const newEntries = Object.keys(sorted).length - existingDates.length;
  console.log(`\nWrote ${Object.keys(sorted).length} price entries to ${OUTPUT_PATH}`);
  console.log(`Added ${newEntries} new entries`);
  console.log(`Range: ${Object.keys(sorted)[0]} to ${Object.keys(sorted).at(-1)}`);
}

main().catch(console.error);
