"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Heart, ThumbsUp, Award, Sparkles, Loader2, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/stats");
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

  useEffect(() => {
    document.title = "Dashboard | RecipeHub";
    setTimeout(() => {
      fetchStats();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpgrade = async () => {
    try {
      setCheckoutLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "premium" }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Could not start upgrade session");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const statCards = [
    { name: "My Published Recipes", value: stats?.totalRecipes || 0, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/20" },
    { name: "Favorite Recipes Saved", value: stats?.totalFavorites || 0, icon: Heart, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/20" },
    { name: "Likes Received", value: stats?.likesReceived || 0, icon: ThumbsUp, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/20" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Welcome back, {user?.name}!</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Here is a quick look at your culinary metrics and recipe statistics.</p>
      </div>

      {/* Premium Banner Upgrade panel */}
      {!stats?.isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white shadow-lg md:p-8"
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2.5 max-w-xl">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-2xs font-extrabold uppercase tracking-wider text-white">
                <Sparkles className="h-3 w-3" /> Go Premium
              </span>
              <h2 className="text-xl font-extrabold md:text-2xl">Unlock Unlimited Recipe Publishing</h2>
              <p className="text-sm text-white/90 leading-relaxed">
                Standard accounts are restricted to 2 recipe submissions. Upgrade to Premium now to publish unlimited creations, get a premium gold badge, and standout in the culinary community!
              </p>
            </div>
            <button
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              className="flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-orange-600 shadow-xl hover:bg-zinc-50 transition-all disabled:opacity-85"
            >
              {checkoutLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
              ) : (
                <>
                  <CreditCard className="h-4.5 w-4.5" /> Upgrade for $19.99
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Premium Badge Highlight if already upgraded */}
      {stats?.isPremium && (
        <div className="flex items-center gap-4 rounded-3xl border border-amber-250 bg-amber-50/50 p-6 dark:border-amber-900/40 dark:bg-amber-950/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/30">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-md font-bold text-zinc-800 dark:text-white flex items-center gap-1.5">
              Premium Active <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-3xs font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-450 uppercase tracking-widest">Active</span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              You have unlocked unlimited recipe publishing. A premium chef badge is displayed on your recipes.
            </p>
          </div>
        </div>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xs font-bold uppercase tracking-wider text-zinc-400">{stat.name}</p>
                  <p className="mt-1 text-2xl font-black text-zinc-800 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
