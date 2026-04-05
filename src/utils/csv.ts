import type { Transaction } from "../types";

function escapeField(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0] ?? "";
}

function formatDatetime(date: Date): string {
  return date.toISOString().replace("T", " ").replace("Z", " UTC");
}

export function generateIrsCsv(transactions: Transaction[]): string {
  const miningOnly = transactions.filter((t) => t.isMiningIncome);
  const headers = [
    "Date Received",
    "Description",
    "Amount (XCH)",
    "Fair Market Value per XCH (USD)",
    "Total Fair Market Value (USD)",
  ];

  const rows = miningOnly.map((t) => [
    escapeField(formatDate(t.date)),
    escapeField(
      t.type === "farming_reward"
        ? "Chia Farming Reward"
        : t.type === "pool_payout"
          ? "Chia Pool Payout"
          : "Chia Mining Income",
    ),
    escapeField(t.amountXch.toFixed(12)),
    escapeField(t.priceUsd !== null ? t.priceUsd.toFixed(2) : "N/A"),
    escapeField(t.valueFmvUsd !== null ? t.valueFmvUsd.toFixed(2) : "N/A"),
  ]);

  return [headers.map(escapeField).join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function generateKoinlyCsv(transactions: Transaction[]): string {
  const miningOnly = transactions.filter((t) => t.isMiningIncome);
  const headers = [
    "Date",
    "Sent Amount",
    "Sent Currency",
    "Received Amount",
    "Received Currency",
    "Fee Amount",
    "Fee Currency",
    "Net Worth Amount",
    "Net Worth Currency",
    "Label",
    "Description",
    "TxHash",
  ];

  const rows = miningOnly.map((t) => [
    escapeField(formatDatetime(t.date)),
    "",
    "",
    escapeField(t.amountXch.toFixed(12)),
    "XCH",
    "",
    "",
    escapeField(t.valueFmvUsd !== null ? t.valueFmvUsd.toFixed(2) : ""),
    "USD",
    "mining",
    escapeField(
      t.type === "farming_reward" ? "Chia Farming Reward" : "Chia Pool Payout",
    ),
    escapeField(t.id),
  ]);

  return [headers.map(escapeField).join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
