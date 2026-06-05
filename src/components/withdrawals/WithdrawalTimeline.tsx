"use client";

import { Transaction } from "@/types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock, XCircle } from "lucide-react";

interface WithdrawalTimelineProps {
  transactions: Transaction[];
}

export function WithdrawalTimeline({ transactions }: WithdrawalTimelineProps) {
  // Sort by date descending
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "pending":
        return <Clock className="h-4 w-4 text-orange-400" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-blue-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-emerald-400 bg-emerald-400/10";
      case "pending":
        return "text-orange-400 bg-orange-400/10";
      case "rejected":
        return "text-red-400 bg-red-400/10";
      default:
        return "text-blue-400 bg-blue-400/10";
    }
  };

  return (
    <Card className="bg-surface-800 border-surface-700 h-full">
      <CardHeader>
        <CardTitle className="text-lg text-white">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative border-l border-surface-600 ml-3 space-y-6 pb-4">
          {sortedTransactions.length === 0 ? (
            <p className="text-gray-400 text-sm pl-4">No transactions recorded yet.</p>
          ) : (
            sortedTransactions.map((t) => {
              const isWithdrawal = t.type === "withdrawal" || t.type === "payout";
              
              return (
                <div key={t.id} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-surface-800 ${isWithdrawal ? "bg-neon-green" : "bg-neon-blue"}`}></div>
                  
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {t.account?.name || "Unknown Account"}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${getStatusColor(t.status)}`}>
                          {getStatusIcon(t.status)}
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })} • {t.method}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-base font-bold flex items-center justify-end gap-1 ${isWithdrawal ? "text-neon-green" : "text-neon-blue"}`}>
                        {isWithdrawal ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                        ${t.amount.toLocaleString()}
                      </div>
                      {t.grossProfit && (
                        <p className="text-[10px] text-gray-500">Gross: ${t.grossProfit.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  
                  {t.notes && (
                    <div className="mt-2 bg-surface-900/50 rounded-md p-2 text-xs text-gray-400 border border-surface-700/50">
                      {t.notes}
                    </div>
                  )}

                  {t.screenshots && (
                    <div className="mt-2">
                      <a href={JSON.parse(t.screenshots)[0]} target="_blank" rel="noreferrer" className="text-xs text-neon-blue hover:underline">
                        View Receipt
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
