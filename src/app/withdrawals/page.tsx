"use client";

import { useEffect, useState } from "react";
import { WithdrawalDashboard } from "@/components/withdrawals/WithdrawalDashboard";
import { WithdrawalAnalytics } from "@/components/withdrawals/WithdrawalAnalytics";
import { WithdrawalTimeline } from "@/components/withdrawals/WithdrawalTimeline";
import { FinancialOverview } from "@/components/withdrawals/FinancialOverview";
import { Achievements } from "@/components/withdrawals/Achievements";
import { WithdrawalForm } from "@/components/withdrawals/WithdrawalForm";
import { Transaction } from "@/types/transaction";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function WithdrawalsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txRes, accRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/accounts")
      ]);
      
      if (txRes.ok) setTransactions(await txRes.json());
      if (accRes.ok) setAccounts(await accRes.json());
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSuccess = () => {
    setShowForm(false);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neon-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Withdrawals & Payouts</h1>
          <p className="text-gray-400 mt-1">Track your cash flow, profit splits, and withdrawal milestones.</p>
        </div>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-neon-green text-surface-900 hover:bg-neon-green/90 shadow-glow-green"
          >
            <Plus className="mr-2 h-4 w-4" /> Record Transaction
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 animate-fade-in">
          <WithdrawalForm 
            accounts={accounts} 
            onSuccess={handleSuccess} 
            onCancel={() => setShowForm(false)} 
          />
        </div>
      )}

      <div className="space-y-6">
        <WithdrawalDashboard transactions={transactions} />
        
        <WithdrawalAnalytics transactions={transactions} />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <FinancialOverview transactions={transactions} accounts={accounts} />
          </div>
          <div className="lg:col-span-1">
            <Achievements transactions={transactions} />
          </div>
          <div className="lg:col-span-1">
            <WithdrawalTimeline transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
  );
}
