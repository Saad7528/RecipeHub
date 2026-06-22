"use client";

import { useEffect, useState } from "react";
import { Users, ShieldAlert, ShieldCheck, Ban, CheckCircle, Loader2 } from "lucide-react";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Manage Users | RecipeHub";
    setTimeout(() => {
      fetchUsers();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (targetUserId, action) => {
    const confirmationMsg = 
      action === "block" ? "Are you sure you want to block this user? They will lose access to the dashboard." :
      action === "unblock" ? "Are you sure you want to unblock this user?" :
      action === "promote" ? "Are you sure you want to promote this user to Admin?" :
      "Are you sure you want to demote this user to User?";

    if (!confirm(confirmationMsg)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "User updated successfully");
        fetchUsers(); // Refresh list
      } else {
        alert(data.error || "Action failed");
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
        <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-xl dark:bg-purple-650 animate-bounce">
          {toastMsg}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Manage Users</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Block or unblock system users, adjust roles, and monitor account permissions.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-zinc-550">
            <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:bg-zinc-950 dark:border-zinc-800 border-b border-zinc-150">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                  <td className="flex items-center gap-3 px-6 py-4 font-semibold text-zinc-850 dark:text-zinc-150">
                    <img
                      src={u.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                      alt={u.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span>{u.name}</span>
                  </td>
                  <td className="px-6 py-4 select-all">{u.email}</td>
                  <td className="px-6 py-4 font-bold capitalize">{u.role}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-3xs font-extrabold uppercase tracking-wider ${
                      u.isPremium
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                        : "bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}>
                      {u.isPremium ? "Premium" : "Standard"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-3xs font-extrabold uppercase tracking-wider ${
                      u.isBlocked
                        ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
                        : "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400"
                    }`}>
                      {u.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Block/Unblock Button */}
                      {u.isBlocked ? (
                        <button
                          onClick={() => handleAction(u._id, "unblock")}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-green-600 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(u._id, "block")}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800"
                        >
                          <Ban className="h-3.5 w-3.5" /> Block
                        </button>
                      )}

                      {/* Promote/Demote Button */}
                      {u.role === "admin" ? (
                        <button
                          onClick={() => handleAction(u._id, "demote")}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800"
                        >
                          Demote
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(u._id, "promote")}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-purple-600 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800"
                        >
                          Make Admin
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
