export interface RawCoinRecord {
  coin: {
    parent_coin_info: string;
    puzzle_hash: string;
    amount: number;
  };
  confirmed_block_index: number;
  spent_block_index: number;
  spent: boolean;
  coinbase: boolean;
  timestamp: number;
}

export type TransactionType = "farming_reward" | "pool_payout" | "received";

export interface Transaction {
  id: string; // hex coin ID derived from parent_coin_info + puzzle_hash + amount
  date: Date;
  timestamp: number;
  amountMojos: number;
  amountXch: number;
  type: TransactionType;
  isMiningIncome: boolean;
  priceUsd: number | null; // XCH/USD price on that day
  valueFmvUsd: number | null; // amountXch * priceUsd
  walletAddress: string;
  puzzleHash: string;
  coinbase: boolean;
  parentCoinInfo: string;
  confirmedBlockIndex: number;
}

export interface PriceMap {
  [dateKey: string]: number; // "YYYY-MM-DD" -> USD price
}

export interface CachedData<T> {
  data: T;
  fetchedAt: number;
}

export interface ApiKeys {
  coingecko?: string;
  coinset?: string;
}

export interface FetchProgress {
  phase: "transactions" | "prices" | "analyzing";
  message: string;
  current: number;
  total: number;
  fromCache?: boolean;
  retrying?: boolean;
  retryAttempt?: number;
}

export interface ExportRowIRS {
  dateReceived: string;
  description: string;
  amountXch: string;
  fairMarketValuePerXch: string;
  totalFmvUsd: string;
}

export interface ExportRowKoinly {
  date: string;
  sentAmount: string;
  sentCurrency: string;
  receivedAmount: string;
  receivedCurrency: string;
  feeAmount: string;
  feeCurrency: string;
  netWorthAmount: string;
  netWorthCurrency: string;
  label: string;
  description: string;
  txHash: string;
}
