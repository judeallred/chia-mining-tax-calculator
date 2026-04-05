# Address Codec

## Purpose

Documents how Chia wallet addresses (`xch1...`) are converted to puzzle hashes for API queries.

## Key Concepts

- Chia uses **bech32m** encoding (BIP-350) for addresses
- A puzzle hash is a 32-byte (64-hex-char) value
- The `xch` prefix identifies the Chia mainnet
- The `bech32` npm package provides encode/decode functions

## File Map

- `src/services/addressCodec.ts` — `addressToPuzzleHash()`, `puzzleHashToAddress()`, `isValidAddress()`

## Data Shapes

| Format | Example |
|--------|---------|
| XCH Address | `xch1dh6udwjex75qdtp8jtedx70a87r5r0hzrc0wwwdh9k3g8k83arfqjdcmw0` |
| Puzzle Hash (hex) | `6df4e35a593bd40356139796e937dfa7e1d06fb90787b9ce6dcb688a3b1e8d24` |
| Puzzle Hash (API) | `0x6df4e35a593bd40356139796e937dfa7e1d06fb90787b9ce6dcb688a3b1e8d24` |

## Conversion Process

### Address → Puzzle Hash

1. Validate the address starts with `xch1`
2. Decode using `bech32m.decode(address, 90)` (90 = max length limit)
3. Verify the prefix is `xch`
4. Convert 5-bit words to 8-bit bytes using `bech32m.fromWords()`
5. Verify the result is exactly 32 bytes
6. Encode bytes as lowercase hex string

### Puzzle Hash → Address

1. Strip optional `0x` prefix
2. Parse hex string into byte array
3. Convert 8-bit bytes to 5-bit words using `bech32m.toWords()`
4. Encode using `bech32m.encode("xch", words, 90)`

## Validation Rules

- Must start with `xch1` (mainnet prefix + bech32m separator)
- Must decode to exactly 32 bytes (256 bits)
- Bech32m checksum must be valid (built into the decode function)
- Input is lowercased and trimmed before processing

## Edge Cases and Gotchas

- Testnet addresses use the `txch` prefix — not supported
- Mixed-case addresses are rejected by bech32m (all lowercase or all uppercase only)
- The `90` length limit in decode/encode accommodates the full xch address length
- Puzzle hashes are stored WITHOUT the `0x` prefix internally but sent WITH `0x` to coinset.org

## Extension Points

- Add `txch` (testnet) support
- Add NFT (`nft1...`) and DID (`did:chia:...`) address support
- Add QR code scanning for address input
