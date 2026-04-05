import type { RawCoinRecord, Transaction, TransactionType, PriceMap } from "../types";
import { lookupPrice } from "../services/coingecko";
import { getMiningOverrides } from "../services/cache";

const MOJOS_PER_XCH = 1_000_000_000_000;

// Known farming reward amounts in mojos per halving era
const REWARD_AMOUNTS_MOJOS = [
  // Era 1: 2 XCH total (0.25 farmer + 1.75 pool)
  0.25 * MOJOS_PER_XCH,
  1.75 * MOJOS_PER_XCH,
  2 * MOJOS_PER_XCH,
  // Era 2 (after March 2024 halving): 1 XCH total
  0.125 * MOJOS_PER_XCH,
  0.875 * MOJOS_PER_XCH,
  1 * MOJOS_PER_XCH,
  // Era 3: 0.5 XCH total
  0.0625 * MOJOS_PER_XCH,
  0.4375 * MOJOS_PER_XCH,
  0.5 * MOJOS_PER_XCH,
];

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function intToBytes(n: number): Uint8Array {
  if (n === 0) return new Uint8Array(0);
  const hex = n.toString(16);
  const padded = hex.length % 2 ? "0" + hex : hex;
  const bytes = hexToBytes(padded);
  if ((bytes[0] ?? 0) >= 0x80) {
    const result = new Uint8Array(bytes.length + 1);
    result.set(bytes, 1);
    return result;
  }
  return bytes;
}

async function coinId(record: RawCoinRecord): Promise<string> {
  const parent = hexToBytes(record.coin.parent_coin_info.replace("0x", ""));
  const ph = hexToBytes(record.coin.puzzle_hash.replace("0x", ""));
  const amt = intToBytes(record.coin.amount);
  const combined = new Uint8Array(parent.length + ph.length + amt.length);
  combined.set(parent, 0);
  combined.set(ph, parent.length);
  combined.set(amt, parent.length + ph.length);
  const hash = await crypto.subtle.digest("SHA-256", combined);
  return bytesToHex(new Uint8Array(hash));
}

function detectType(record: RawCoinRecord): TransactionType {
  if (record.coinbase) return "farming_reward";

  const amount = record.coin.amount;
  const isRewardAmount = REWARD_AMOUNTS_MOJOS.includes(amount);
  if (isRewardAmount) return "pool_payout";

  // Heuristic: very small amounts from repeated parents suggest pool payouts
  const xchAmount = amount / MOJOS_PER_XCH;
  if (xchAmount > 0 && xchAmount < 0.5) return "pool_payout";

  return "received";
}

function shouldClassifyAsMining(type: TransactionType): boolean {
  return type === "farming_reward" || type === "pool_payout";
}

export async function processRecords(
  records: RawCoinRecord[],
  walletAddress: string,
  puzzleHash: string,
  prices: PriceMap,
  taxYear: number,
): Promise<Transaction[]> {
  const overrides = getMiningOverrides();
  const yearStart = new Date(`${taxYear}-01-01T00:00:00Z`).getTime() / 1000;
  const yearEnd = new Date(`${taxYear}-12-31T23:59:59Z`).getTime() / 1000;

  const filtered = records.filter(
    (r) => r.timestamp >= yearStart && r.timestamp <= yearEnd,
  );

  const transactions = await Promise.all(
    filtered.map(async (record): Promise<Transaction> => {
      const id = await coinId(record);
      const date = new Date(record.timestamp * 1000);
      const amountXch = record.coin.amount / MOJOS_PER_XCH;
      const type = detectType(record);
      const autoMining = shouldClassifyAsMining(type);
      const isMiningIncome = overrides[id] ?? autoMining;
      const priceUsd = lookupPrice(prices, date);
      const valueFmvUsd = priceUsd !== null ? amountXch * priceUsd : null;

      return {
        id,
        date,
        timestamp: record.timestamp,
        amountMojos: record.coin.amount,
        amountXch,
        type,
        isMiningIncome,
        priceUsd,
        valueFmvUsd,
        walletAddress,
        puzzleHash,
        coinbase: record.coinbase,
        parentCoinInfo: record.coin.parent_coin_info,
        confirmedBlockIndex: record.confirmed_block_index,
      };
    }),
  );

  return transactions.sort((a, b) => a.timestamp - b.timestamp);
}
