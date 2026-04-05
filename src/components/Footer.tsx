import { useState } from "react";

const TIP_ADDRESS = "xch1dh6udwjex75qdtp8jtedx70a87r5r0hzrc0wwwdh9k3g8k83arfqjdcmw0";

export default function Footer() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(TIP_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
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
            href="https://github.com/blinkymach12"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            @blinkymach12
          </a>
        </p>

        <div className="inline-flex flex-col items-center gap-2">
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
        </div>
      </div>
    </footer>
  );
}
