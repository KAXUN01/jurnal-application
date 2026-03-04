"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface Account {
    id: string;
    name: string;
    type: string;
    balance: number;
    accountSize: string;
    brokerName: string;
    currency: string;
    leverage: string;
    startDate?: string;
    notes?: string;
}

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    
    // Form state
    const [name, setName] = useState("");
    const [type, setType] = useState("demo");
    const [balance, setBalance] = useState("0");
    const [accountSize, setAccountSize] = useState("5k");
    const [brokerName, setBrokerName] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [leverage, setLeverage] = useState("1:100");
    const [startDate, setStartDate] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        fetchAccounts();
    }, []);

    async function fetchAccounts() {
        try {
            const res = await fetch('/api/accounts');
            if (!res.ok) throw new Error('Failed to load accounts');
            const data = await res.json();
            setAccounts(data || []);
        } catch (e) {
            console.error(e);
            setError("Failed to load accounts");
        }
    }

    function validateForm() {
        if (!name.trim()) {
            setError("Account name is required");
            return false;
        }
        if (!brokerName.trim()) {
            setError("Broker name is required");
            return false;
        }
        if (!type) {
            setError("Account type is required");
            return false;
        }
        if (!accountSize) {
            setError("Account size is required");
            return false;
        }
        setError("");
        return true;
    }

    async function createAccount() {
        if (!validateForm()) return;
        
        try {
            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    type,
                    balance: parseFloat(balance) || 0,
                    accountSize,
                    brokerName: brokerName.trim(),
                    currency,
                    leverage,
                    startDate: startDate || null,
                    notes: notes.trim() || null,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to create');
            }
            // Reset form
            setName('');
            setType('demo');
            setBalance('0');
            setAccountSize('5k');
            setBrokerName('');
            setCurrency('USD');
            setLeverage('1:100');
            setStartDate('');
            setNotes('');
            setError('');
            fetchAccounts();
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to create account';
            console.error(e);
            setError(message);
        }
    }

    async function saveAccount(id: string, updatedData: Partial<Account>) {
        try {
            const res = await fetch(`/api/accounts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            if (!res.ok) throw new Error('Failed to save');
            setEditingId(null);
            setError('');
            fetchAccounts();
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to save';
            console.error(e);
            setError(message);
        }
    }

    async function deleteAccount(id: string) {
        if (!confirm('Delete this account permanently?')) return;
        try {
            const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            setError('');
            fetchAccounts();
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to delete';
            console.error(e);
            setError(message);
        }
    }

    return (
        <div className="space-y-5 max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold text-white">Trading Accounts</h1>
                <p className="text-sm text-gray-400 mt-1">Manage your demo, funded, and personal trading accounts</p>
            </div>

            {/* Documentation */}
            <Card className="border border-blue-500/20 bg-blue-500/5">
                <CardHeader>
                    <CardTitle className="text-sm text-blue-400">📋 Account Details Documentation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-gray-300">
                    <div>
                        <span className="font-semibold">Required Fields:</span>
                        <ul className="ml-4 mt-1 space-y-1">
                            <li>✓ <strong>Account Name:</strong> A unique identifier for your account (e.g., "Demo Account 1", "Funded Account - IC Markets")</li>
                            <li>✓ <strong>Account Type:</strong> Demo, Funded, or Personal</li>
                            <li>✓ <strong>Broker Name:</strong> Your broker platform (e.g., IC Markets, Deriv, Forex.com, etc.)</li>
                            <li>✓ <strong>Account Size:</strong> The capital amount (5k, 10k, 100k, or custom)</li>
                        </ul>
                    </div>
                    <div>
                        <span className="font-semibold">Optional Fields:</span>
                        <ul className="ml-4 mt-1 space-y-1">
                            <li>• <strong>Balance:</strong> Current account balance</li>
                            <li>• <strong>Currency:</strong> Account base currency (USD, EUR, GBP, etc.)</li>
                            <li>• <strong>Leverage:</strong> Trading leverage ratio (1:100, 1:500, etc.)</li>
                            <li>• <strong>Start Date:</strong> When account was opened</li>
                            <li>• <strong>Notes:</strong> Any additional information</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
                <div className="p-3 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Create Account Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">+ Create New Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Row 1: Account Name, Type, Account Size */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Account Name *</label>
                                <Input 
                                    placeholder="e.g., Demo Account 1" 
                                    value={name} 
                                    onChange={(e) => setName((e.target as HTMLInputElement).value)} 
                                    className="text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Account Type *</label>
                                <Select value={type} onChange={(e) => setType((e.target as HTMLSelectElement).value)}>
                                    <option value="demo">Demo</option>
                                    <option value="funded">Funded</option>
                                    <option value="personal">Personal</option>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Account Size *</label>
                                <Input 
                                    placeholder="e.g., 5k, 10k, 100k, $50,000" 
                                    value={accountSize} 
                                    onChange={(e) => setAccountSize((e.target as HTMLInputElement).value)} 
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        {/* Row 2: Broker Name, Currency, Balance */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Broker Name *</label>
                                <Input 
                                    placeholder="e.g., IC Markets" 
                                    value={brokerName} 
                                    onChange={(e) => setBrokerName((e.target as HTMLInputElement).value)} 
                                    className="text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Currency</label>
                                <Input 
                                    placeholder="USD" 
                                    value={currency} 
                                    onChange={(e) => setCurrency((e.target as HTMLInputElement).value)} 
                                    className="text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Balance</label>
                                <Input 
                                    type="number" 
                                    placeholder="0" 
                                    value={balance} 
                                    onChange={(e) => setBalance((e.target as HTMLInputElement).value)} 
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        {/* Row 3: Leverage, Start Date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Leverage</label>
                                <Input 
                                    placeholder="1:100" 
                                    value={leverage} 
                                    onChange={(e) => setLeverage((e.target as HTMLInputElement).value)} 
                                    className="text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                                <Input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate((e.target as HTMLInputElement).value)} 
                                    className="text-sm"
                                />
                            </div>
                        </div>

                        {/* Row 4: Notes */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Notes</label>
                            <textarea 
                                placeholder="Add any additional notes about this account..." 
                                value={notes} 
                                onChange={(e) => setNotes((e.target as HTMLTextAreaElement).value)}
                                rows={2}
                                className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-sm text-white resize-none"
                            />
                        </div>

                        <button 
                            onClick={createAccount}
                            className="w-full px-4 py-2 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20 transition"
                        >
                            Create Account
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Accounts List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Your Accounts ({accounts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {accounts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No accounts created yet. Create your first account above.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {accounts.map((account) => (
                                <AccountCard 
                                    key={account.id}
                                    account={account}
                                    isEditing={editingId === account.id}
                                    onEdit={() => setEditingId(account.id)}
                                    onSave={(data) => saveAccount(account.id, data)}
                                    onDelete={() => deleteAccount(account.id)}
                                    onCancel={() => setEditingId(null)}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Account Card Component
function AccountCard({ 
    account, 
    isEditing, 
    onEdit, 
    onSave, 
    onDelete, 
    onCancel 
}: { 
    account: Account;
    isEditing: boolean;
    onEdit: () => void;
    onSave: (data: Partial<Account>) => void;
    onDelete: () => void;
    onCancel: () => void;
}) {
    const [formData, setFormData] = useState(account);

    if (isEditing) {
        return (
            <div className="p-4 border rounded-lg bg-gray-900 border-gray-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InputField label="Name" value={formData.name} onChange={(name) => setFormData({ ...formData, name })} />
                    <SelectField label="Type" value={formData.type} onChange={(type) => setFormData({ ...formData, type })} options={[
                        { value: "demo", label: "Demo" },
                        { value: "funded", label: "Funded" },
                        { value: "personal", label: "Personal" }
                    ]} />
                    <InputField label="Broker" value={formData.brokerName} onChange={(brokerName) => setFormData({ ...formData, brokerName })} />
                    <InputField label="Size" value={formData.accountSize} onChange={(accountSize) => setFormData({ ...formData, accountSize })} />
                    <InputField label="Balance" type="number" value={String(formData.balance)} onChange={(balance) => setFormData({ ...formData, balance: parseFloat(balance) })} />
                    <InputField label="Currency" value={formData.currency} onChange={(currency) => setFormData({ ...formData, currency })} />
                    <InputField label="Leverage" value={formData.leverage} onChange={(leverage) => setFormData({ ...formData, leverage })} />
                    <InputField label="Start Date" type="date" value={formData.startDate || ""} onChange={(startDate) => setFormData({ ...formData, startDate })} />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Notes</label>
                    <textarea 
                        value={formData.notes || ""} 
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-sm text-white resize-none"
                    />
                </div>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => onSave(formData)} className="px-3 py-1 rounded bg-neon-green/10 text-neon-green border border-neon-green/30 text-sm">Save</button>
                    <button onClick={onCancel} className="px-3 py-1 rounded border border-gray-600 text-sm">Cancel</button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 border rounded-lg bg-gray-900/50 border-gray-700 flex items-start justify-between">
            <div className="flex-1">
                <div className="font-semibold text-white">{account.name}</div>
                <div className="text-xs text-gray-400 mt-2 grid grid-cols-2 sm:grid-cols-3 gap-y-1">
                    <div><span className="text-gray-500">Type:</span> <span className="text-neon-green">{account.type}</span></div>
                    <div><span className="text-gray-500">Broker:</span> {account.brokerName}</div>
                    <div><span className="text-gray-500">Size:</span> {account.accountSize}</div>
                    <div><span className="text-gray-500">Balance:</span> {account.currency} {account.balance.toFixed(2)}</div>
                    <div><span className="text-gray-500">Leverage:</span> {account.leverage}</div>
                    {account.startDate && <div><span className="text-gray-500">Started:</span> {account.startDate}</div>}
                </div>
                {account.notes && <div className="text-xs text-gray-500 mt-2">📝 {account.notes}</div>}
            </div>
            <div className="flex gap-2 ml-4">
                <button onClick={onEdit} className="px-3 py-1 rounded border border-gray-600 text-sm hover:border-gray-400 transition">Edit</button>
                <button onClick={onDelete} className="px-3 py-1 rounded text-sm text-red-400 hover:text-red-300 transition">Delete</button>
            </div>
        </div>
    );
}

// Helper Components
function InputField({ label, type = "text", value, onChange }: any) {
    return (
        <div>
            <label className="block text-xs text-gray-400 mb-1">{label}</label>
            <Input 
                type={type}
                value={value} 
                onChange={(e) => onChange((e.target as HTMLInputElement).value)}
                className="text-sm"
            />
        </div>
    );
}

function SelectField({ label, value, onChange, options }: any) {
    return (
        <div>
            <label className="block text-xs text-gray-400 mb-1">{label}</label>
            <Select value={value} onChange={(e) => onChange((e.target as HTMLSelectElement).value)}>
                {options.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </Select>
        </div>
    );
}
