"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, DollarSign, TrendingUp, Wallet } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { useMemo } from "react";

interface WithdrawalDashboardProps {
  transactions: Transaction[];
}

export function WithdrawalDashboard({ transactions }: WithdrawalDashboardProps) {
  const stats = useMemo(() => {
    const withdrawals = transactions.filter(t => t.type === "withdrawal" || t.type === "payout");
    const deposits = transactions.filter(t => t.type === "deposit");

    const totalWithdrawn = withdrawals.reduce((sum, t) => sum + t.amount, 0);
    const totalDeposited = deposits.reduce((sum, t) => sum + t.amount, 0);
    const netIncome = totalWithdrawn - totalDeposited;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthWithdrawn = withdrawals
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const largestWithdrawal = withdrawals.length > 0 
      ? Math.max(...withdrawals.map(t => t.amount))
      : 0;

    const averageWithdrawal = withdrawals.length > 0
      ? totalWithdrawn / withdrawals.length
      : 0;

    const completedWithdrawals = withdrawals.filter(t => t.status === "Completed").length;
    const totalAttemptedWithdrawals = withdrawals.length;
    const successRate = totalAttemptedWithdrawals > 0 
      ? (completedWithdrawals / totalAttemptedWithdrawals) * 100 
      : 0;

    return {
      totalWithdrawn,
      thisMonthWithdrawn,
      largestWithdrawal,
      averageWithdrawal,
      netIncome,
      successRate
    };
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-surface-800 border-surface-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Total Withdrawn</CardTitle>
          <Wallet className="h-4 w-4 text-neon-green" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalWithdrawn)}</div>
          <p className="text-xs text-gray-500 mt-1">Lifetime withdrawals</p>
        </CardContent>
      </Card>
      
      <Card className="bg-surface-800 border-surface-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">This Month Withdrawn</CardTitle>
          <TrendingUp className="h-4 w-4 text-neon-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(stats.thisMonthWithdrawn)}</div>
          <p className="text-xs text-gray-500 mt-1">Current month total</p>
        </CardContent>
      </Card>

      <Card className="bg-surface-800 border-surface-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Largest Withdrawal</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-neon-purple" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(stats.largestWithdrawal)}</div>
          <p className="text-xs text-gray-500 mt-1">Highest single payout</p>
        </CardContent>
      </Card>

      <Card className="bg-surface-800 border-surface-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Average Withdrawal</CardTitle>
          <DollarSign className="h-4 w-4 text-neon-orange" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatCurrency(stats.averageWithdrawal)}</div>
          <p className="text-xs text-gray-500 mt-1">Mean per payout</p>
        </CardContent>
      </Card>

      <Card className="bg-surface-800 border-surface-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Net Trading Income</CardTitle>
          <ArrowDownRight className="h-4 w-4 text-emerald-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-400">{formatCurrency(stats.netIncome)}</div>
          <p className="text-xs text-gray-500 mt-1">Total Withdrawn - Total Deposits</p>
        </CardContent>
      </Card>

      <Card className="bg-surface-800 border-surface-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Withdrawal Success Rate</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.successRate.toFixed(1)}%</div>
          <p className="text-xs text-gray-500 mt-1">Completed vs total requested</p>
        </CardContent>
      </Card>
    </div>
  );
}
