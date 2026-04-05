import { useState, useEffect } from "react";
import type { ApiKeys } from "../types";
import { getApiKeys, setApiKeys as saveApiKeys } from "../services/cache";

interface ApiSettingsProps {
  onChange: (keys: ApiKeys) => void;
}

export default function ApiSettings({ onChange }: ApiSettingsProps) {
  const [open, setOpen] = useState(false);
  const [keys, setKeys] = useState<ApiKeys>(() => getApiKeys());

  useEffect(() => {
    onChange(keys);
  }, [keys, onChange]);

  function update(field: keyof ApiKeys, value: string) {
    const updated = { ...keys, [field]: value || undefined };
    setKeys(updated);
    saveApiKeys(updated);
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          API Settings
        </span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-200 px-4 py-4 space-y-4">
          <p className="text-xs text-gray-500">
            Price data is bundled with the app. Coinset.org is used for blockchain data
            and does not currently require an API key.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coinset.org API Key
            </label>
            <input
              type="password"
              value={keys.coinset ?? ""}
              onChange={(e) => update("coinset", e.target.value)}
              placeholder="Not currently required"
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-400">
              Coinset.org does not currently require authentication.
            </p>
          </div>

          <p className="text-xs text-gray-400">
            Keys are stored in your browser only and never sent anywhere except the respective API.
          </p>
        </div>
      )}
    </div>
  );
}
