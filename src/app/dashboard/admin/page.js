"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Users, BookOpen, AlertTriangle, Loader2, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
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

  const adminCards = [
    { name: "Total Users registered", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
    { name: "Total Recipes published", value: stats?.totalRecipes || 0, icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
    { name: "Premium Subscribers", value: stats?.totalPremiumMembers || 0, icon: Award, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
    { name: "Pending Abuse Reports", value: stats?.totalReports || 0, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-purple-600 dark:text-purple-400" /> Admin Control Stats
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Overall monitoring dashboard for recipe activities, members, and reports.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {adminCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.name}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-2xs font-bold uppercase tracking-wider text-zinc-450">{card.name}</p>
                  <p className="mt-1 text-2xl font-black text-zinc-800 dark:text-white">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
