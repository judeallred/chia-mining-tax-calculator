import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const REPO_URL = "https://github.com/judeallred/chia-farming-tax-calculator";
const TIP_ADDRESS = "xch1dltucau5fpq60p88w9qp0smcxny2yu5ypfncwzvslqvy32cr5w8sw76pmr";

export default function AboutSection() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(TIP_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = TIP_ADDRESS;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

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
            <strong>Chia Farming Tax Calculator</strong> is a free, open-source, client-side tool
            for calculating Chia (XCH) farming income taxes. All data processing happens
            in your browser — nothing is sent to any server beyond the Coinset.org public API.
          </p>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 text-xs space-y-1">
            <p>
              <strong>Important:</strong> All calculations are provided on a best-effort basis.
              Price data, transaction classification, and cost basis figures may be inaccurate
              or incomplete. <strong>You are solely responsible for verifying all data before
              using it for tax filing or any other purpose.</strong>
            </p>
            <p>
              This tool does not provide tax, legal, or accounting advice. The authors and
              contributors accept no liability for errors, omissions, or any losses arising
              from the use of this tool. Consult a qualified tax professional for your
              specific situation.
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-700 mb-1">How Fair Market Value Is Calculated</p>
            <p>
              Each incoming transaction is matched to the daily closing price of XCH in USD on the
              date it was confirmed on-chain. Prices are sourced from{" "}
              <a
                href="https://www.cryptocompare.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 underline"
              >
                CryptoCompare
              </a>
              {" "}and bundled into the app at build time — no runtime API calls are made for price
              data. If a price is unavailable for the exact date, the nearest available price within
              3 days is used. The fair market value is then calculated as the amount of XCH received
              multiplied by that day's closing price.
            </p>
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

          <div>
            <p className="font-medium text-gray-700 mb-1">Was This Helpful?</p>
            <p className="mb-3">
              Did I help you out? There's <strong>no tracking</strong> on this site, so please let me know
              by tossing a mojo in the tip jar.
            </p>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <span className="font-mono text-xs text-gray-600 max-w-[280px] truncate sm:max-w-none">
                  {TIP_ADDRESS}
                </span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200 transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-2">
                <QRCodeSVG value={TIP_ADDRESS} size={120} level="M" fgColor="#065f46" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
