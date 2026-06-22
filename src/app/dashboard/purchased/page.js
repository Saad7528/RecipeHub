"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Eye, Clock, Loader2 } from "lucide-react";

export default function MyPurchasedRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchasedRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/purchased");
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.recipes);
      }
    } catch (err) {
      console.error("Error fetching purchased recipes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Purchased Recipes | RecipeHub";
    setTimeout(() => {
      fetchPurchasedRecipes();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Purchased Recipes</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Unlocked premium signature recipes you have bought.</p>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-3xl text-center px-4">
          <ShoppingBag className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
          <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300">No purchases found</h3>
          <p className="text-sm text-zinc-450 dark:text-zinc-550 mt-1 max-w-xs">
            Unlock master chef secrets by purchasing premium locked recipes.
          </p>
          <Link
            href="/recipes"
            className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-500"
          >
            Explore Recipes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <div
              key={recipe._id}
              className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
                  <img src={recipe.recipeImage} alt={recipe.recipeName} className="h-full w-full object-cover" />
                  <div className="absolute top-3 left-3 rounded-lg bg-green-600/90 px-2 py-0.5 text-2xs font-bold text-white shadow-sm">
                    Unlocked
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-2xs font-semibold text-emerald-600 uppercase tracking-wider">
                    <span>{recipe.category}</span>
                    <span className="text-zinc-300 dark:text-zinc-750">&bull;</span>
                    <span>{recipe.cuisineType}</span>
                  </div>
                  <h3 className="mt-2 text-base font-bold text-zinc-800 dark:text-zinc-100 line-clamp-1">{recipe.recipeName}</h3>
                  <div className="mt-4 flex items-center gap-4 text-xs text-zinc-450">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {recipe.preparationTime} min</span>
                    <span>By {recipe.authorName}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex border-t border-zinc-100 dark:border-zinc-800 p-3 bg-zinc-50/50 dark:bg-zinc-900/20">
                <Link
                  href={`/recipes/${recipe._id}`}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-white border border-zinc-200 py-2.5 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-350 dark:hover:bg-zinc-900"
                >
                  <Eye className="h-3.5 w-3.5" /> View Recipe Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
