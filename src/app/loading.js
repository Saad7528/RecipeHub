import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-40 gap-4 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
      <p className="text-sm font-semibold text-zinc-500">Loading recipe content...</p>
    </div>
  );
}
