"use client";

import { Transaction } from "@/types/transaction";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface WithdrawalAnalyticsProps {
  transactions: Transaction[];
}

const COLORS = ['#00FF94', '#00E5FF', '#9D00FF', '#FF9900', '#FF0055'];

export function WithdrawalAnalytics({ transactions }: WithdrawalAnalyticsProps) {
  const { monthlyData, accountData, methodData } = useMemo(() => {
    const withdrawals = transactions.filter(t => t.type === "withdrawal" || t.type === "payout");

    // Monthly Data
    const monthlyMap = new Map<string, number>();
    withdrawals.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + t.amount);
    });
    
    const monthlyData = Array.from(monthlyMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Account Data
    const accountMap = new Map<string, number>();
    withdrawals.forEach(t => {
      const name = t.account?.name || "Unknown Account";
      accountMap.set(name, (accountMap.get(name) || 0) + t.amount);
    });
    
    const accountData = Array.from(accountMap.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Method Data
    const methodMap = new Map<string, number>();
    withdrawals.forEach(t => {
      const method = t.method || "Other";
      methodMap.set(method, (methodMap.get(method) || 0) + t.amount);
    });
    
    const methodData = Array.from(methodMap.entries())
      .map(([name, value]) => ({ name, value }));

    return { monthlyData, accountData, methodData };
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-900 border border-surface-700 p-3 rounded-lg shadow-xl">
          <p className="text-gray-300 text-sm mb-1">{label || payload[0].name}</p>
          <p className="text-white font-bold">
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      {/* Monthly Trend */}
      <Card className="bg-surface-800 border-surface-700 col-span-2 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg text-white">Monthly Withdrawals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#00FF94" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#00FF94', strokeWidth: 2, stroke: '#111827' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals by Account */}
      <Card className="bg-surface-800 border-surface-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">By Account</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={accountData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#374151', opacity: 0.4 }} />
                <Bar dataKey="amount" fill="#00E5FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals by Method */}
      <Card className="bg-surface-800 border-surface-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">By Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full flex items-center justify-center">
            <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={methodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {methodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="middle" 
                  align="right"
                  layout="vertical"
                  wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
