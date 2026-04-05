import { useState, useCallback, useRef } from "react";
import type { Transaction, FetchProgress, PriceMap } from "./types";
import AddressInput from "./components/AddressInput";
import TaxYearSelector, { getDefaultTaxYear } from "./components/TaxYearSelector";
import TransactionTable from "./components/TransactionTable";
import Summary from "./components/Summary";
import ExportButton from "./components/ExportButton";
import ProgressPanel from "./components/ProgressPanel";
import AboutSection from "./components/AboutSection";
import Footer from "./components/Footer";
import { addressToPuzzleHash } from "./services/addressCodec";
import { fetchAllAddresses } from "./services/coinset";
import { loadPricesForYear } from "./services/coingecko";
import { clearCacheForQuery } from "./services/cache";
import { processRecords } from "./utils/mining";

export default function App() {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [taxYear, setTaxYear] = useState<number>(getDefaultTaxYear);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [progress, setProgress] = useState<FetchProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const handleCalculate = useCallback(
    async (forceRefresh = false) => {
      if (addresses.length === 0) {
        setError("Please add at least one wallet address.");
        return;
      }

      setError(null);
      setIsLoading(true);
      setTransactions([]);
      abortRef.current = false;

      try {
        const puzzleHashes = addresses.map((addr) => ({
          address: addr,
          puzzleHash: addressToPuzzleHash(addr),
        }));

        if (forceRefresh) {
          clearCacheForQuery(puzzleHashes.map((p) => p.puzzleHash));
        }

        // Fetch coin records from coinset.org
        const allResults = await fetchAllAddresses(puzzleHashes, {
          forceRefresh,
          taxYear,
          onProgress: setProgress,
        });

        if (abortRef.current) return;

        // Load bundled price data (local static JSON, no network call)
        setProgress({
          phase: "prices",
          message: "Loading price data...",
          current: 0,
          total: 1,
        });
        const prices: PriceMap = await loadPricesForYear(taxYear);
        setProgress({
          phase: "prices",
          message: `Loaded ${Object.keys(prices).length} daily prices`,
          current: 1,
          total: 1,
        });

        if (abortRef.current) return;

        // Classify transactions and calculate cost basis
        setProgress({
          phase: "analyzing",
          message: "Classifying transactions and calculating cost basis...",
          current: 0,
          total: 1,
        });

        const allTransactions: Transaction[] = [];
        for (const { records, address } of allResults) {
          const ph = puzzleHashes.find((p) => p.address === address);
          if (!ph) continue;
          const txs = await processRecords(records, address, ph.puzzleHash, prices, taxYear);
          allTransactions.push(...txs);
        }

        const seen = new Set<string>();
        const deduped = allTransactions.filter((tx) => {
          if (seen.has(tx.id)) return false;
          seen.add(tx.id);
          return true;
        });
        deduped.sort((a, b) => a.timestamp - b.timestamp);

        setTransactions(deduped);
        setProgress({
          phase: "analyzing",
          message: `Done! Found ${deduped.length} transactions.`,
          current: 1,
          total: 1,
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setError(`Error: ${msg}`);
      } finally {
        setIsLoading(false);
      }
    },
    [addresses, taxYear],
  );

  const handleMiningToggle = useCallback((id: string, value: boolean) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === id ? { ...tx, isMiningIncome: value } : tx,
      ),
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="seedling">🌱</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ChiaMiningTaxCalculator</h1>
              <p className="text-sm text-gray-500">Calculate cost basis for Chia farming income</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <AboutSection />

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="space-y-4">
          <AddressInput onChange={setAddresses} />
          <TaxYearSelector value={taxYear} onChange={setTaxYear} />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => void handleCalculate(false)}
            disabled={isLoading || addresses.length === 0}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Calculating..." : "Calculate"}
          </button>
          <button
            onClick={() => void handleCalculate(true)}
            disabled={isLoading || addresses.length === 0}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Refresh Data
          </button>
          {transactions.length > 0 && (
            <div className="ml-auto">
              <ExportButton transactions={transactions} taxYear={taxYear} />
            </div>
          )}
        </div>

        <ProgressPanel progress={progress} isLoading={isLoading} />

        {transactions.length > 0 && (
          <>
            <Summary transactions={transactions} taxYear={taxYear} />
            <TransactionTable
              transactions={transactions}
              onMiningToggle={handleMiningToggle}
            />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
