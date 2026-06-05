export interface Transaction {
  id: string;
  date: string;
  accountId: string;
  account?: any; // You can type this as Account if needed
  type: "withdrawal" | "deposit" | "payout";
  amount: number;
  currency: string;
  method: string;
  status: "Pending" | "Approved" | "Completed" | "Rejected" | string;
  notes?: string | null;
  screenshots?: string | null;
  grossProfit?: number | null;
  propShare?: number | null;
  traderShare?: number | null;
  netReceived?: number | null;
  createdAt: Date;
  updatedAt: Date;
}
