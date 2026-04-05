import { useState, useEffect } from "react";
import { isValidAddress } from "../services/addressCodec";
import { getAddresses, setAddresses as saveAddresses } from "../services/cache";

interface AddressInputProps {
  onChange: (addresses: string[]) => void;
}

export default function AddressInput({ onChange }: AddressInputProps) {
  const [addresses, setAddresses] = useState<string[]>(() => getAddresses());
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onChange(addresses);
  }, [addresses, onChange]);

  function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!isValidAddress(trimmed)) {
      setError("Invalid Chia address. Must start with xch1 and be a valid bech32m address.");
      return;
    }
    if (addresses.includes(trimmed)) {
      setError("Address already added.");
      return;
    }
    const updated = [...addresses, trimmed];
    setAddresses(updated);
    saveAddresses(updated);
    setInput("");
    setError(null);
  }

  function handleRemove(index: number) {
    const updated = addresses.filter((_, i) => i !== index);
    setAddresses(updated);
    saveAddresses(updated);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Wallet Addresses
      </label>

      {addresses.length > 0 && (
        <ul className="space-y-2">
          {addresses.map((addr, i) => (
            <li
              key={addr}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-mono"
            >
              <span className="flex-1 truncate">{addr}</span>
              <button
                onClick={() => handleRemove(i)}
                className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Remove address"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="xch1..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <button
          onClick={handleAdd}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          Add
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
