import { bech32m } from "bech32";

const XCH_PREFIX = "xch";

export function addressToPuzzleHash(address: string): string {
  // Validate and decode xch1... address to hex puzzle hash
  const trimmed = address.trim().toLowerCase();
  if (!trimmed.startsWith(XCH_PREFIX + "1")) {
    throw new Error(`Invalid Chia address: must start with "${XCH_PREFIX}1"`);
  }
  const decoded = bech32m.decode(trimmed, 90);
  if (decoded.prefix !== XCH_PREFIX) {
    throw new Error(`Invalid address prefix: expected "${XCH_PREFIX}", got "${decoded.prefix}"`);
  }
  const data = bech32m.fromWords(decoded.words);
  if (data.length !== 32) {
    throw new Error(`Invalid puzzle hash length: expected 32 bytes, got ${data.length}`);
  }
  return Array.from(data)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function puzzleHashToAddress(puzzleHash: string): string {
  const cleanHex = puzzleHash.startsWith("0x") ? puzzleHash.slice(2) : puzzleHash;
  const bytes: number[] = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes.push(parseInt(cleanHex.substring(i, i + 2), 16));
  }
  const words = bech32m.toWords(new Uint8Array(bytes));
  return bech32m.encode(XCH_PREFIX, words, 90);
}

export function isValidAddress(address: string): boolean {
  try {
    addressToPuzzleHash(address);
    return true;
  } catch {
    return false;
  }
}
