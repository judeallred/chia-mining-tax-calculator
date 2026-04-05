import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const TIP_ADDRESS = "xch1dltucau5fpq60p88w9qp0smcxny2yu5ypfncwzvslqvy32cr5w8sw76pmr";

export default function Footer() {
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
    <footer className="border-t border-gray-200 bg-white mt-12">
      <div className="mx-auto max-w-5xl px-4 py-8 text-center">
        <p className="text-sm text-gray-600 mb-4">
          Made with 🌱 by{" "}
          <a
            href="https://github.com/judeallred"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            @judeallred
          </a>
        </p>

        <div className="inline-flex flex-col items-center gap-3">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Tip Jar
          </span>
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
            <QRCodeSVG
              value={TIP_ADDRESS}
              size={120}
              level="M"
              fgColor="#065f46"
            />
          </div>
        </div>

        <p className="mt-6 text-[10px] leading-relaxed text-gray-400 max-w-xl mx-auto">
          All calculations are provided on a best-effort basis. Price data, transaction
          classification, and cost basis figures may be inaccurate or incomplete. You are solely
          responsible for verifying all data before using it for tax filing or any other purpose.
          This tool does not provide tax, legal, or accounting advice. The authors and contributors
          accept no liability for errors, omissions, or any losses arising from the use of this tool.
        </p>
      </div>
    </footer>
  );
}
