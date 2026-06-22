"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Trash2, Eye, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RecipeReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (reportId) => {
    if (!confirm("Are you sure you want to dismiss this report? The recipe will remain active.")) return;

    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "dismissed" }),
      });

      if (res.ok) {
        setReports(reports.filter((r) => r._id !== reportId));
        showToast("Report dismissed successfully");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveRecipe = async (recipeId, reportId) => {
    if (!confirm("Are you sure you want to remove this recipe from the platform? This will delete the recipe and resolve the report.")) return;

    try {
      // 1. Delete Recipe
      const resRecipe = await fetch(`/api/recipes/${recipeId}`, { method: "DELETE" });
      if (resRecipe.ok) {
        // 2. Resolve Report
        await fetch(`/api/reports/${reportId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "resolved" }),
        });

        setReports(reports.filter((r) => r._id !== reportId));
        showToast("Recipe removed and report resolved");
      } else {
        alert("Failed to delete recipe. It might have been deleted already.");
        // Still remove the stale report
        await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
        setReports(reports.filter((r) => r._id !== reportId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-xl dark:bg-purple-655 animate-bounce">
          {toastMsg}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Recipe Reports</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Review community abuse reports. Dismiss flags or delete offensive recipe uploads.</p>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-3xl text-center px-4">
          <AlertTriangle className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
          <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300">Clean slate!</h3>
          <p className="text-sm text-zinc-450 dark:text-zinc-555 mt-1 max-w-xs">
            No pending recipe flags are currently registered.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-zinc-500">
              <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:bg-zinc-950 dark:border-zinc-800 border-b border-zinc-150">
                <tr>
                  <th className="px-6 py-4">Flagged Recipe</th>
                  <th className="px-6 py-4">Reporter</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Date Flagged</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                    <td className="px-6 py-4 font-semibold text-zinc-850 dark:text-zinc-150 flex items-center gap-3">
                      {r.recipeImage ? (
                        <img src={r.recipeImage} alt={r.recipeName} className="h-8 w-8 rounded object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded bg-zinc-200" />
                      )}
                      <div>
                        <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{r.recipeName}</div>
                        <div className="text-3xs text-zinc-450">Author: {r.recipeAuthorEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{r.reporterEmail}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded bg-red-150 px-2 py-0.5 text-2xs font-extrabold uppercase tracking-wider text-red-700 dark:bg-red-950/40 dark:text-red-400">
                        {r.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {r.recipeName !== "Unknown/Deleted Recipe" && (
                          <Link
                            href={`/recipes/${r.recipeId}`}
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-55 text-zinc-650 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        <button
                          onClick={() => handleDismiss(r._id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-650 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-350"
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-green-600" /> Dismiss
                        </button>
                        <button
                          onClick={() => handleRemoveRecipe(r.recipeId, r._id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 border border-red-100 px-3 py-1.5 text-xs font-bold text-red-650 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-450"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove Recipe
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
