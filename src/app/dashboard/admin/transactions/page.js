"use client";

import { useEffect, useState } from "react";
import { Receipt, Loader2, DollarSign, Calendar } from "lucide-react";

export default function AdminTransactions() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/transactions");
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
            <Receipt className="h-8 w-8 text-purple-650" /> Transactions Log
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">View receipts and audit statements for premium updates and recipe unlocks.</p>
        </div>

        {/* Revenue Counter Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/20">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <div className="text-3xs font-bold uppercase text-zinc-400">Total Revenue</div>
            <div className="text-lg font-black text-zinc-800 dark:text-white">${totalRevenue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-3xl text-center px-4">
          <Receipt className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
          <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300">No transactions recorded</h3>
          <p className="text-sm text-zinc-450 dark:text-zinc-555 mt-1 max-w-xs">
            Completed checkout sequences will automatically populate here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-500">
              <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:bg-zinc-950 dark:border-zinc-800 border-b border-zinc-150">
                <tr>
                  <th className="px-6 py-4">User Email</th>
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4">Paid At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {payments.map((p) => {
                  const isPremium = p.recipeId === null;
                  return (
                    <tr key={p._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                      <td className="px-6 py-4 font-semibold text-zinc-800 dark:text-zinc-200 select-all">{p.userEmail}</td>
                      <td className="px-6 py-4 font-mono text-3xs text-zinc-450 select-all max-w-[120px] truncate">{p.transactionId}</td>
                      <td className="px-6 py-4 font-bold text-xs">
                        {isPremium ? (
                          <span className="text-purple-650">Premium Upgrade</span>
                        ) : (
                          <span className="text-zinc-550">Recipe Purchase</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-zinc-800 dark:text-zinc-100">${p.amount?.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-2xs font-extrabold uppercase tracking-wider text-green-700 dark:bg-green-950/40 dark:text-green-400">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        <div className="flex items-center gap-1 text-xs">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{p.paidAt ? new Date(p.paidAt).toLocaleString() : "N/A"}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
