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

function coinId(record: RawCoinRecord): string {
  // Simplified coin ID from the record fields
  const parent = record.coin.parent_coin_info.replace("0x", "");
  const ph = record.coin.puzzle_hash.replace("0x", "");
  const amt = record.coin.amount.toString(16);
  return `${parent.slice(0, 8)}${ph.slice(0, 8)}${amt}`;
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

export function processRecords(
  records: RawCoinRecord[],
  walletAddress: string,
  puzzleHash: string,
  prices: PriceMap,
  taxYear: number,
): Transaction[] {
  const overrides = getMiningOverrides();
  const yearStart = new Date(`${taxYear}-01-01T00:00:00Z`).getTime() / 1000;
  const yearEnd = new Date(`${taxYear}-12-31T23:59:59Z`).getTime() / 1000;

  return records
    .filter((r) => r.timestamp >= yearStart && r.timestamp <= yearEnd)
    .map((record): Transaction => {
      const id = coinId(record);
      const date = new Date(record.timestamp * 1000);
      const amountXch = record.coin.amount / MOJOS_PER_XCH;
      const type = detectType(record);
      const autoMining = shouldClassifyAsMining(type);
      const isMiningIncome = overrides[id] !== undefined ? overrides[id]! : autoMining;
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
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}
