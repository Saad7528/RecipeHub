import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-32 px-4 text-center bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="rounded-full bg-emerald-50 p-6 text-emerald-600 dark:bg-emerald-950/20 mb-6">
        <Compass className="h-16 w-16 animate-bounce" />
      </div>
      <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white sm:text-5xl">404 - Page Not Found</h1>
      <p className="mt-4 text-sm text-zinc-550 dark:text-zinc-400 max-w-sm leading-relaxed">
        Oops! The culinary path you are looking for does not exist. It might have been relocated or consumed!
      </p>
      <Link
        href="/"
        className="mt-8 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/10 hover:bg-emerald-500"
      >
        Back to Home
      </Link>
    </div>
  );
}
