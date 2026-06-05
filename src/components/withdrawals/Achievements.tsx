"use client";

import { Transaction } from "@/types/transaction";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Crown, Gem, Lock, Star, Trophy, Zap } from "lucide-react";
import { useMemo } from "react";

interface AchievementsProps {
  transactions: Transaction[];
}

export function Achievements({ transactions }: AchievementsProps) {
  const achievements = useMemo(() => {
    const withdrawals = transactions.filter(t => t.type === "withdrawal" || t.type === "payout");
    const totalWithdrawn = withdrawals.reduce((sum, t) => sum + t.amount, 0);
    const maxWithdrawal = withdrawals.length > 0 ? Math.max(...withdrawals.map(t => t.amount)) : 0;
    const cryptoWithdrawals = withdrawals.filter(t => t.method.toLowerCase() === "crypto");
    const fundedPayouts = withdrawals.filter(t => t.type === "payout");

    return [
      {
        id: "first_withdrawal",
        title: "First Withdrawal",
        description: "Successfully withdrew your first trading profits.",
        unlocked: withdrawals.length > 0,
        icon: Award,
        color: "text-neon-blue",
        bg: "bg-neon-blue/10"
      },
      {
        id: "first_1k",
        title: "$1,000 Milestone",
        description: "Reached $1,000 in total lifetime withdrawals.",
        unlocked: totalWithdrawn >= 1000,
        icon: Trophy,
        color: "text-neon-orange",
        bg: "bg-neon-orange/10"
      },
      {
        id: "first_10k",
        title: "$10,000 Milestone",
        description: "Reached $10,000 in total lifetime withdrawals.",
        unlocked: totalWithdrawn >= 10000,
        icon: Trophy,
        color: "text-emerald-400",
        bg: "bg-emerald-400/10"
      },
      {
        id: "first_funded_payout",
        title: "First Funded Payout",
        description: "Received a payout from a Prop Firm account.",
        unlocked: fundedPayouts.length > 0,
        icon: Award,
        color: "text-neon-purple",
        bg: "bg-neon-purple/10"
      },
      {
        id: "consistent_earner",
        title: "Consistent Earner",
        description: "Successfully completed 5 or more withdrawals.",
        unlocked: withdrawals.length >= 5,
        icon: Star,
        color: "text-yellow-400",
        bg: "bg-yellow-400/10"
      },
      {
        id: "high_roller",
        title: "High Roller",
        description: "Received a single payout over $5,000.",
        unlocked: maxWithdrawal >= 5000,
        icon: Gem,
        color: "text-rose-400",
        bg: "bg-rose-400/10"
      },
      {
        id: "crypto_cashout",
        title: "Crypto Cashout",
        description: "Withdrew profits using Cryptocurrency.",
        unlocked: cryptoWithdrawals.length > 0,
        icon: Zap,
        color: "text-cyan-400",
        bg: "bg-cyan-400/10"
      },
      {
        id: "pro_trader",
        title: "$50,000 Milestone",
        description: "Reached $50,000 in total lifetime withdrawals.",
        unlocked: totalWithdrawn >= 50000,
        icon: Crown,
        color: "text-fuchsia-400",
        bg: "bg-fuchsia-400/10"
      }
    ];
  }, [transactions]);

  return (
    <Card className="bg-surface-800 border-surface-700 h-full">
      <CardHeader>
        <CardTitle className="text-lg text-white">Milestones & Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div 
                key={achievement.id} 
                className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  achievement.unlocked 
                    ? `bg-surface-900 border-surface-700 ${achievement.color} shadow-[0_0_15px_rgba(0,0,0,0.1)]` 
                    : 'bg-surface-900/30 border-surface-800 text-gray-600 opacity-60 grayscale'
                }`}
              >
                <div className={`p-3 rounded-full mb-3 ${achievement.unlocked ? achievement.bg : 'bg-surface-800'}`}>
                  {achievement.unlocked ? (
                    <Icon className="h-6 w-6" />
                  ) : (
                    <Lock className="h-6 w-6" />
                  )}
                </div>
                <h4 className={`text-sm font-bold mb-1 ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
                  {achievement.title}
                </h4>
                <p className="text-[10px] text-gray-500 line-clamp-2">
                  {achievement.description}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
