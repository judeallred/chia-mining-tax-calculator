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
  id: string;
  date: Date;
  timestamp: number;
  amountMojos: number;
  amountXch: number;
  type: TransactionType;
  isMiningIncome: boolean;
  priceUsd: number | null;
  valueFmvUsd: number | null;
  walletAddress: string;
  puzzleHash: string;
  coinbase: boolean;
  parentCoinInfo: string;
  confirmedBlockIndex: number;
}

export interface PriceMap {
  [dateKey: string]: number;
}

export interface CachedData<T> {
  data: T;
  fetchedAt: number;
}

export interface ApiKeys {
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
