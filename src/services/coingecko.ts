import type { PriceMap } from "../types";

let cachedPrices: PriceMap | null = null;

async function loadBundledPrices(): Promise<PriceMap> {
  if (cachedPrices) return cachedPrices;
  try {
    const response = await fetch("./data/xch-usd-daily.json");
    if (!response.ok) return {};
    cachedPrices = (await response.json()) as PriceMap;
    return cachedPrices;
  } catch {
    return {};
  }
}

export async function loadPricesForYear(year: number): Promise<PriceMap> {
  const all = await loadBundledPrices();
  const yearPrefix = String(year);
  const filtered: PriceMap = {};
  for (const [dateKey, price] of Object.entries(all)) {
    if (dateKey.startsWith(yearPrefix)) {
      filtered[dateKey] = price;
    }
  }
  return filtered;
}

export function lookupPrice(prices: PriceMap, date: Date): number | null {
  const dateKey = date.toISOString().split("T")[0] ?? "";
  const price = prices[dateKey];
  if (price !== undefined) return price;

  for (let offset = 1; offset <= 3; offset++) {
    const before = new Date(date);
    before.setDate(before.getDate() - offset);
    const beforeKey = before.toISOString().split("T")[0] ?? "";
    const beforePrice = prices[beforeKey];
    if (beforePrice !== undefined) return beforePrice;

    const after = new Date(date);
    after.setDate(after.getDate() + offset);
    const afterKey = after.toISOString().split("T")[0] ?? "";
    const afterPrice = prices[afterKey];
    if (afterPrice !== undefined) return afterPrice;
  }

  return null;
}
