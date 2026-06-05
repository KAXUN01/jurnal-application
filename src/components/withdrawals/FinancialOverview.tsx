"use client";

import { Transaction } from "@/types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Percent, TrendingUp, Wallet } from "lucide-react";
import { useMemo } from "react";

interface FinancialOverviewProps {
  transactions: Transaction[];
  accounts: { balance?: number; [key: string]: unknown }[];
}

export function FinancialOverview({ transactions, accounts }: FinancialOverviewProps) {
  const stats = useMemo(() => {
    const withdrawals = transactions.filter(t => t.type === "withdrawal" || t.type === "payout").reduce((sum, t) => sum + t.amount, 0);
    const deposits = transactions.filter(t => t.type === "deposit").reduce((sum, t) => sum + t.amount, 0);
    
    // Trading Profit logic (mocked or derived if available, but here we can use account balances + withdrawals - deposits)
    const currentAccountBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    const totalLifetimeEarnings = (currentAccountBalance + withdrawals) - deposits;
    
    // Assuming reinvested capital = deposits + left in accounts? 
    const reinvestedCapital = currentAccountBalance; 

    // ROI
    const roi = deposits > 0 ? (totalLifetimeEarnings / deposits) * 100 : 0;

    return {
      withdrawnProfit: withdrawals,
      currentAccountBalance,
      totalLifetimeEarnings,
      reinvestedCapital,
      roi
    };
  }, [transactions, accounts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="bg-surface-800 border-surface-700 h-full">
      <CardHeader>
        <CardTitle className="text-lg text-white">Financial Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex items-center justify-between p-3 bg-surface-900 rounded-lg border border-surface-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-400/10 rounded-lg">
              <Wallet className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Withdrawn Profit</p>
              <p className="text-xs text-gray-500">Total cash extracted</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-emerald-400">{formatCurrency(stats.withdrawnProfit)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-surface-900 rounded-lg border border-surface-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-blue/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-neon-blue" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Current Balance</p>
              <p className="text-xs text-gray-500">Across all active accounts</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-white">{formatCurrency(stats.currentAccountBalance)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-surface-900 rounded-lg border border-surface-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-purple/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-neon-purple" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Lifetime Earnings</p>
              <p className="text-xs text-gray-500">Total generated from trading</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-white">{formatCurrency(stats.totalLifetimeEarnings)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-surface-900 rounded-lg border border-surface-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-orange/10 rounded-lg">
              <Percent className="h-5 w-5 text-neon-orange" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Overall ROI</p>
              <p className="text-xs text-gray-500">Return on deposits</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-neon-orange">{stats.roi.toFixed(1)}%</p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
