"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UploadCloud, X } from "lucide-react";

interface WithdrawalFormProps {
  accounts: { id: string; name: string; type: string; [key: string]: unknown }[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function WithdrawalForm({ accounts, onSuccess, onCancel }: WithdrawalFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<{ id: string; name: string; type: string; [key: string]: unknown } | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState("withdrawal");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [method, setMethod] = useState("Bank Transfer");
  const [status, setStatus] = useState("Completed");
  const [notes, setNotes] = useState("");

  // Profit Split State (for funded accounts)
  const [grossProfit, setGrossProfit] = useState("");
  const [propShare, setPropShare] = useState("");

  const handleAccountChange = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    setSelectedAccount(acc || null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setFileUrl(data.url);
      } else {
        alert("File upload failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error uploading file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return alert("Please select an account");
    if (!amount) return alert("Please enter an amount");

    setLoading(true);

    const payload = {
      date,
      accountId: selectedAccount.id,
      type,
      amount: parseFloat(amount),
      currency,
      method,
      status,
      notes,
      screenshots: fileUrl ? [fileUrl] : null,
      grossProfit: grossProfit ? parseFloat(grossProfit) : null,
      propShare: propShare ? parseFloat(propShare) : null,
      traderShare: grossProfit && propShare ? parseFloat(grossProfit) * (1 - parseFloat(propShare) / 100) : null,
      netReceived: type === "withdrawal" || type === "payout" ? parseFloat(amount) : null,
    };

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        onSuccess();
      } else {
        alert("Failed to save transaction");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isFunded = selectedAccount?.type === "funded";

  return (
    <div className="bg-surface-800 border border-surface-700 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Record Transaction</h2>
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-gray-400 hover:text-white p-2">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="withdrawal" className="bg-surface-800">Withdrawal</option>
              <option value="payout" className="bg-surface-800">Funded Payout</option>
              <option value="deposit" className="bg-surface-800">Deposit</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Account</Label>
            <Select value={selectedAccount?.id || ""} onChange={(e) => handleAccountChange(e.target.value)}>
              <option value="" disabled className="bg-surface-800">Select account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id} className="bg-surface-800">
                  {acc.name} ({acc.type})
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="flex gap-2">
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-[100px]">
                <option value="USD" className="bg-surface-800">USD</option>
                <option value="EUR" className="bg-surface-800">EUR</option>
                <option value="GBP" className="bg-surface-800">GBP</option>
              </Select>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
                className="flex-1"
              />
            </div>
          </div>

          {isFunded && (type === "payout" || type === "withdrawal") && (
            <>
              <div className="space-y-2">
                <Label>Gross Profit ($)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="10000" 
                  value={grossProfit} 
                  onChange={(e) => setGrossProfit(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Prop Firm Share (%)</Label>
                <Input 
                  type="number" 
                  step="0.1" 
                  placeholder="20" 
                  value={propShare} 
                  onChange={(e) => setPropShare(e.target.value)} 
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Method</Label>
            <Select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="Bank Transfer" className="bg-surface-800">Bank Transfer</option>
              <option value="Wise" className="bg-surface-800">Wise</option>
              <option value="PayPal" className="bg-surface-800">PayPal</option>
              <option value="Crypto" className="bg-surface-800">Crypto</option>
              <option value="Deel" className="bg-surface-800">Deel</option>
              <option value="Other" className="bg-surface-800">Other</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Completed" className="bg-surface-800">Completed</option>
              <option value="Pending" className="bg-surface-800">Pending</option>
              <option value="Approved" className="bg-surface-800">Approved</option>
              <option value="Rejected" className="bg-surface-800">Rejected</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea 
            placeholder="e.g., Phase 2 payout from The5ers" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            rows={3} 
          />
        </div>

        <div className="space-y-2">
          <Label>Screenshot / Certificate</Label>
          <div className="border-2 border-dashed border-surface-600 rounded-xl p-6 flex flex-col items-center justify-center bg-surface-900/50">
            <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-400 mb-4">Upload payment proof (PNG, JPG, PDF)</p>
            <Input 
              type="file" 
              accept=".jpg,.jpeg,.png,.pdf" 
              onChange={handleFileUpload} 
              className="max-w-xs"
            />
            {fileUrl && (
              <p className="text-sm text-neon-green mt-2">File uploaded successfully!</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-700">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-neon-green text-surface-900 hover:bg-neon-green/90">
            {loading ? "Saving..." : "Save Transaction"}
          </Button>
        </div>
      </form>
    </div>
  );
}
