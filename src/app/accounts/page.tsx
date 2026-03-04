"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<Array<any>>([]);
    const [name, setName] = useState("");
    const [type, setType] = useState("demo");
    const [balance, setBalance] = useState(0);
    const [editingId, setEditingId] = useState<string | null>(null);

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
        }
    }

    async function createAccount() {
        try {
            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type, balance }),
            });
            if (!res.ok) throw new Error('Failed to create');
            setName(''); setType('demo'); setBalance(0);
            fetchAccounts();
        } catch (e) { console.error(e); alert('Failed to create account'); }
    }

    async function saveAccount(id: string, nameVal: string, typeVal: string, bal: number) {
        try {
            const res = await fetch(`/api/accounts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: nameVal, type: typeVal, balance: bal }),
            });
            if (!res.ok) throw new Error('Failed to save');
            setEditingId(null);
            fetchAccounts();
        } catch (e) { console.error(e); alert('Failed to save'); }
    }

    async function deleteAccount(id: string) {
        if (!confirm('Delete this account?')) return;
        try {
            const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            fetchAccounts();
        } catch (e) { console.error(e); alert('Failed to delete'); }
    }

    return (
        <div className="space-y-5 max-w-3xl">
            <h1 className="text-2xl font-bold text-white">Accounts</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Create Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input placeholder="Account name" value={name} onChange={(e) => setName((e.target as HTMLInputElement).value)} />
                        <Select value={type} onChange={(e) => setType((e.target as HTMLSelectElement).value)}>
                            <option value="demo">Demo</option>
                            <option value="funded">Funded</option>
                            <option value="real">Real</option>
                        </Select>
                        <Input type="number" value={String(balance)} onChange={(e) => setBalance(parseFloat((e.target as HTMLInputElement).value || '0'))} />
                    </div>
                    <div className="mt-3">
                        <button onClick={createAccount} className="px-4 py-2 rounded-lg bg-neon-green/10 text-neon-green border border-neon-green/30">Create</button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Your Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {accounts.map((a) => (
                            <div key={a.id} className="flex items-center justify-between p-2 border rounded">
                                {editingId === a.id ? (
                                    <div className="flex gap-2 items-center flex-1">
                                        <Input defaultValue={a.name} id={`name-${a.id}`} />
                                        <Select defaultValue={a.type} id={`type-${a.id}`}>
                                            <option value="demo">Demo</option>
                                            <option value="funded">Funded</option>
                                            <option value="real">Real</option>
                                        </Select>
                                        <Input type="number" defaultValue={String(a.balance)} id={`bal-${a.id}`} />
                                    </div>
                                ) : (
                                    <div>
                                        <div className="font-semibold">{a.name} <span className="text-xs text-gray-400">({a.type})</span></div>
                                        <div className="text-xs text-gray-500">Balance: {a.balance}</div>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    {editingId === a.id ? (
                                        <>
                                            <button onClick={() => {
                                                const nameInput = (document.getElementById(`name-${a.id}`) as HTMLInputElement).value;
                                                const typeInput = (document.getElementById(`type-${a.id}`) as HTMLSelectElement).value;
                                                const balInput = parseFloat((document.getElementById(`bal-${a.id}`) as HTMLInputElement).value || '0');
                                                saveAccount(a.id, nameInput, typeInput, balInput);
                                            }} className="px-2 py-1 rounded bg-neon-green/10 text-neon-green">Save</button>
                                            <button onClick={() => setEditingId(null)} className="px-2 py-1 rounded border">Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => setEditingId(a.id)} className="px-2 py-1 rounded border">Edit</button>
                                            <button onClick={() => deleteAccount(a.id)} className="px-2 py-1 rounded text-red-400">Delete</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
