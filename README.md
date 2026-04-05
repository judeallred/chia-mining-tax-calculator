# 🌱 Chia Mining Tax Calculator

Free, open-source, client-side Chia (XCH) farming/mining tax calculator. Calculate cost basis and generate IRS-ready CSV reports — all in your browser.

**[Live Demo →](https://judeallred.github.io/chia-mining-tax-calculator/)**

## Features

- **Multi-wallet support** — Input one or more XCH wallet addresses
- **Automatic mining detection** — Identifies farming rewards (coinbase) and pool payouts
- **Cost basis calculation** — XCH/USD prices from bundled historical data at time of receipt
- **Tax year filtering** — Select a specific tax year (2021–present)
- **CSV export** — IRS Schedule 1/C format and Koinly Universal format
- **Privacy-first** — All processing happens in your browser. No data is sent to any server.
- **Offline-capable** — Bundled historical price data, no runtime API calls for prices
- **Resilient** — Automatic retries with exponential backoff for API calls

## Quick Start

```bash
git clone https://github.com/judeallred/chia-mining-tax-calculator.git
cd chia-mining-tax-calculator
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## How It Works

1. Enter your Chia wallet address(es) (e.g., `xch1...`)
2. Select the tax year
3. Click **Calculate**
4. Review the transaction table — farming rewards and pool payouts are auto-detected
5. Toggle the "Mining Income" checkbox for any transaction you want to include/exclude
6. Export to CSV for tax filing

## Data Sources

- **[Coinset.org](https://coinset.org)** — Chia blockchain transaction data
- **[CryptoCompare](https://www.cryptocompare.com)** — Historical XCH/USD price data (bundled at build time)

## Deploying to GitHub Pages

The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages on push to `main`.

To set it up:
1. Go to your repository's Settings → Pages
2. Set Source to "GitHub Actions"
3. Push to `main` — the site will deploy automatically

## Architecture

See the [docs/](docs/) folder for detailed design documentation, including:
- [Architecture overview](docs/architecture.md)
- [Coinset.org API integration](docs/api-coinset.md)
- [CoinGecko API integration](docs/api-coingecko.md)
- [Caching strategy](docs/caching.md)
- [Mining detection logic](docs/mining-detection.md)

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Disclaimer

This tool does not provide tax, legal, or accounting advice. All information is for informational purposes only. Consult a qualified professional for your specific situation.

## License

[MIT](LICENSE)
