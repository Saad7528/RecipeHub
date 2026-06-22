"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Sun, Moon, Menu, X, User as UserIcon, LogOut, LayoutDashboard, Utensils, Award } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [theme, setTheme] = useState("light");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    // Check initial theme class
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Recipes", href: "/recipes" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md transition-colors duration-300 dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-500">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/50">
                <Utensils className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent font-extrabold dark:from-emerald-400 dark:to-teal-400">
                RecipeHub
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                    isActive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            {/* User Session */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-zinc-200 p-1 pr-3 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  <img
                    src={user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover border border-emerald-500/20"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100";
                    }}
                  />
                  <span className="text-xs font-semibold max-w-[100px] truncate">{user.name}</span>
                  {user.isPremium && (
                    <Award className="h-4 w-4 text-amber-500 fill-amber-500 animate-pulse" />
                  )}
                </button>

                {isProfileDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-zinc-200 bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 z-20">
                      <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                        <p className="text-xs font-semibold text-zinc-400">Signed in as</p>
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">{user.email}</p>
                      </div>
                      <Link
                        href={user.role === "admin" ? "/dashboard/admin" : "/dashboard"}
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
                      >
                        <UserIcon className="h-4 w-4" />
                        Profile Settings
                      </Link>
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 hover:shadow dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Theme Toggle (Mobile) */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-zinc-200 bg-white py-2 shadow-inner dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-base font-medium ${
                    isActive
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-zinc-200 pb-3 pt-4 dark:border-zinc-800">
            {user ? (
              <div className="px-4">
                <div className="flex items-center gap-3">
                  <img
                    src={user.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-base font-semibold text-zinc-800 dark:text-zinc-100">{user.name}</span>
                      {user.isPremium && (
                        <Award className="h-4 w-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-zinc-500 truncate block max-w-[200px]">{user.email}</span>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    href={user.role === "admin" ? "/dashboard/admin" : "/dashboard"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-base text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-base text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-base text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 px-4">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-center rounded-xl border border-zinc-200 px-4 py-2 text-base font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-center rounded-xl bg-emerald-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
