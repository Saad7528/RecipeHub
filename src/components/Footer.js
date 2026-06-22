import Link from "next/link";
import { Utensils, Mail, Phone, MapPin, Globe, Send, Heart, Compass } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo and Intro */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-emerald-600 dark:text-emerald-500">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                <Utensils className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
                RecipeHub
              </span>
            </Link>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              A vibrant community for food lovers. Discover recipes, share your culinary creations, and elevate your cooking.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/recipes" className="text-sm text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors">
                  Browse Recipes
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 transition-colors">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <Mail className="h-4 w-4 text-emerald-500" />
                <span>support@recipehub.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <Phone className="h-4 w-4 text-emerald-500" />
                <span>+1 (555) 019-2834</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>123 Culinary Ave, Food City</span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-150 border border-zinc-200 text-zinc-600 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 transition-all">
                <Globe className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-150 border border-zinc-200 text-zinc-600 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 transition-all">
                <Send className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-150 border border-zinc-200 text-zinc-600 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 transition-all">
                <Heart className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-150 border border-zinc-200 text-zinc-600 hover:bg-emerald-50 hover:text-emerald-600 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-emerald-950/20 dark:hover:text-emerald-400 transition-all">
                <Compass className="h-4 w-4" />
              </a>
            </div>
          </div>

        </div>

        <div className="mt-12 border-t border-zinc-200 pt-6 text-center dark:border-zinc-800">
          <p className="text-xs text-zinc-400">
            &copy; {currentYear} RecipeHub. All rights reserved. Built with love for food enthusiasts.
          </p>
        </div>
      </div>
    </footer>
  );
}
