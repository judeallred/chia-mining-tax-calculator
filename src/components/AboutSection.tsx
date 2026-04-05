import { useState } from "react";

const REPO_URL = "https://github.com/blinkymach12/ChiaMiningTaxCalculator";

export default function AboutSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          About This Tool
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-200 px-4 py-4 space-y-4 text-sm text-gray-600">
          <p>
            <strong>ChiaMiningTaxCalculator</strong> is a free, open-source, client-side tool
            for calculating Chia (XCH) farming/mining income taxes. All data processing happens
            in your browser — nothing is sent to any server beyond the CoinGecko and Coinset.org
            public APIs.
          </p>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 text-xs">
            <strong>Disclaimer:</strong> This tool does not provide tax, legal, or accounting advice.
            All information is for informational purposes only. Consult a qualified professional
            for your specific situation.
          </div>

          <div>
            <p className="font-medium text-gray-700 mb-1">Contribute</p>
            <p>
              This is an open-source project. Pull requests, bug reports, and feature requests
              are welcome!{" "}
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 underline"
              >
                View on GitHub
              </a>
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-700 mb-1">Need More?</p>
            <p className="mb-2">
              For advanced tracking, alerts, CAT/NFT support, and automatic classification:
            </p>
            <ul className="space-y-1 ml-4">
              <li>
                <a
                  href="https://chiatracker.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 underline"
                >
                  Chia Tracker
                </a>
                {" — "}Full-featured wallet tracking with alerts and automatic classification
              </li>
              <li>
                <a
                  href="https://spacescan.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 underline"
                >
                  Spacescan.io
                </a>
                {" — "}Blockchain explorer with built-in tax statement exports
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
