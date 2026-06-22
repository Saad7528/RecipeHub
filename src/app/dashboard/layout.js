"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  Heart,
  ShoppingBag,
  User,
  ShieldCheck,
  Users,
  AlertTriangle,
  Receipt,
  Menu,
  X,
  Award,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-40">
        <LoaderSpinner />
      </div>
    );
  }

  if (!user) {
    return null; // Let middleware handle redirection
  }

  const userNavigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Add Recipe", href: "/dashboard/add-recipe", icon: PlusCircle },
    { name: "My Recipes", href: "/dashboard/my-recipes", icon: BookOpen },
    { name: "My Favorites", href: "/dashboard/favorites", icon: Heart },
    { name: "Purchased Recipes", href: "/dashboard/purchased", icon: ShoppingBag },
    { name: "Profile Settings", href: "/dashboard/profile", icon: User },
  ];

  const adminNavigation = [
    { name: "Admin Stats", href: "/dashboard/admin", icon: ShieldCheck },
    { name: "Manage Users", href: "/dashboard/admin/users", icon: Users },
    { name: "Manage Recipes", href: "/dashboard/admin/recipes", icon: BookOpen },
    { name: "Recipe Reports", href: "/dashboard/admin/reports", icon: AlertTriangle },
    { name: "Transactions", href: "/dashboard/admin/transactions", icon: Receipt },
  ];

  return (
    <div className="flex flex-1 flex-col md:flex-row min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* Mobile Toggle Top Bar */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
        <span className="text-sm font-bold text-zinc-800 dark:text-white">Dashboard</span>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-lg border border-zinc-250 p-1.5 text-zinc-500 dark:border-zinc-800"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Slide-out Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative flex w-64 max-w-xs flex-1 flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-left duration-250">
            <SidebarContent user={user} pathname={pathname} setIsSidebarOpen={setIsSidebarOpen} userNavigation={userNavigation} adminNavigation={adminNavigation} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:block w-64 flex-shrink-0 bg-white border-r border-zinc-200/80 dark:bg-zinc-950 dark:border-zinc-850">
        <SidebarContent user={user} pathname={pathname} setIsSidebarOpen={setIsSidebarOpen} userNavigation={userNavigation} adminNavigation={adminNavigation} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-5xl overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

function SidebarContent({ user, pathname, setIsSidebarOpen, userNavigation, adminNavigation }) {
  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        {/* User Card */}
        <div className="flex items-center gap-3 rounded-2xl bg-zinc-50 p-4 border border-zinc-150 dark:bg-zinc-900/50 dark:border-zinc-800">
          <img
            src={user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
            alt={user.name}
            className="h-10 w-10 rounded-full object-cover border border-emerald-500/20"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <p className="truncate text-sm font-bold text-zinc-800 dark:text-white">{user.name}</p>
              {user.isPremium && (
                <Award className="h-4 w-4 text-amber-500 fill-amber-500" />
              )}
            </div>
            <p className="truncate text-xs text-zinc-450 dark:text-zinc-550 capitalize">{user.role}</p>
          </div>
        </div>

        {/* User Links */}
        <div className="space-y-1">
          <p className="px-3 text-3xs font-bold uppercase tracking-widest text-zinc-400">Dashboard</p>
          {userNavigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
                    : "text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className={`h-3.5 w-3.5 opacity-60 ${isActive ? "block" : "hidden"}`} />
              </Link>
            );
          })}
        </div>

        {/* Admin Links */}
        {user.role === "admin" && (
          <div className="space-y-1 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <p className="px-3 text-3xs font-bold uppercase tracking-widest text-zinc-400">Admin Control</p>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/10"
                      : "text-zinc-650 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4.5 w-4.5" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className={`h-3.5 w-3.5 opacity-60 ${isActive ? "block" : "hidden"}`} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function LoaderSpinner() {
  return (
    <div className="flex items-center gap-2 text-zinc-500 font-semibold">
      <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      <span>Loading dashboard...</span>
    </div>
  );
}
