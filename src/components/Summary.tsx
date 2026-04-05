import type { Transaction } from "../types";
import { formatXch, formatUsd } from "../utils/format";

interface SummaryProps {
  transactions: Transaction[];
  taxYear: number;
}

export default function Summary({ transactions, taxYear }: SummaryProps) {
  const miningTxs = transactions.filter((t) => t.isMiningIncome);
  const totalXch = miningTxs.reduce((sum, t) => sum + t.amountXch, 0);
  const totalUsd = miningTxs.reduce((sum, t) => sum + (t.valueFmvUsd ?? 0), 0);
  const farmingRewards = miningTxs.filter((t) => t.type === "farming_reward");
  const poolPayouts = miningTxs.filter((t) => t.type === "pool_payout");
  const missingPrices = miningTxs.filter((t) => t.priceUsd === null).length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {taxYear} Mining Income Summary
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-sm text-gray-500">Total Mining Income</p>
          <p className="text-2xl font-bold text-emerald-600">{formatUsd(totalUsd)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total XCH Received</p>
          <p className="text-2xl font-bold text-gray-900">{formatXch(totalXch)} XCH</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Farming Rewards</p>
          <p className="text-lg font-semibold text-gray-700">{farmingRewards.length}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Pool Payouts</p>
          <p className="text-lg font-semibold text-gray-700">{poolPayouts.length}</p>
        </div>
      </div>

      {missingPrices > 0 && (
        <p className="mt-4 text-sm text-amber-600">
          ⚠ {missingPrices} transaction{missingPrices !== 1 ? "s" : ""} missing price data.
          Total USD may be incomplete.
        </p>
      )}

      <p className="mt-4 text-xs text-gray-400">
        All {transactions.length} incoming transactions shown. {miningTxs.length} classified as mining income.
      </p>
    </div>
  );
}
