export function formatXch(amount: number): string {
  if (amount >= 1) return amount.toFixed(4);
  if (amount >= 0.01) return amount.toFixed(6);
  return amount.toFixed(12);
}

export function formatUsd(amount: number | null): string {
  if (amount === null) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDatetime(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function truncateMiddle(str: string, maxLen: number = 16): string {
  if (str.length <= maxLen) return str;
  const half = Math.floor((maxLen - 3) / 2);
  return `${str.slice(0, half)}...${str.slice(-half)}`;
}

export function transactionTypeLabel(type: string): string {
  switch (type) {
    case "farming_reward":
      return "Farming Reward";
    case "pool_payout":
      return "Pool Payout (est.)";
    case "received":
      return "Received";
    default:
      return type;
  }
}
