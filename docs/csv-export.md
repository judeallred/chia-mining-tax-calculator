# CSV Export

## Purpose

Documents the CSV export formats for tax reporting.

## Key Concepts

- Only transactions marked as mining income are exported
- Two formats available: IRS and Koinly Universal
- Files are generated client-side and downloaded via Blob URL

## File Map

- `src/utils/csv.ts` — `generateIrsCsv()`, `generateKoinlyCsv()`, `downloadCsv()`
- `src/components/ExportButton.tsx` — UI trigger with format selection dropdown

## Data Shapes

Exports are one CSV row per mining-income transaction. Two schemas are supported.

### IRS Format (Schedule 1 / Schedule C)

For reporting mining income as self-employment or other income.

### Columns

| Column | Description | Example |
|--------|-------------|---------|
| Date Received | ISO date (YYYY-MM-DD) | 2024-03-15 |
| Description | Type of income | Chia Farming Reward |
| Amount (XCH) | XCH amount (12 decimal places) | 0.250000000000 |
| Fair Market Value per XCH (USD) | Price on that day | 35.42 |
| Total Fair Market Value (USD) | Amount × Price | 8.86 |

### Usage

Report the "Total Fair Market Value" column sum as mining income on:
- **Schedule C** (if farming is a business)
- **Schedule 1, Line 8** (if farming is a hobby)

### Koinly Universal Format

Compatible with Koinly, TurboTax, and similar tax software.

### Columns

| Column | Description |
|--------|-------------|
| Date | Full datetime with timezone |
| Sent Amount | Empty (receiving only) |
| Sent Currency | Empty |
| Received Amount | XCH amount |
| Received Currency | XCH |
| Fee Amount | Empty |
| Fee Currency | Empty |
| Net Worth Amount | FMV in USD |
| Net Worth Currency | USD |
| Label | "mining" |
| Description | Type description |
| TxHash | Coin ID |

## Edge Cases and Gotchas

- Transactions with `null` price show "N/A" in the CSV
- XCH amounts use 12 decimal places (matching mojo precision)
- CSV fields containing commas or quotes are properly escaped
- The Koinly date format includes timezone info

## Extension Points

- Add TurboTax 8949 format for capital gains reporting
- Add configurable decimal precision
- Add "export all transactions" option (not just mining income)
- Add PDF report generation
