"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, Clock, Flame, Heart, ChevronLeft, ChevronRight, RefreshCw, Layers } from "lucide-react";

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snacks", "Beverages", "Soup", "Salad"];
const CUISINES = ["Italian", "Mexican", "Indian", "Chinese", "American", "Japanese", "French", "Thai", "Mediterranean"];

export default function BrowseRecipes() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Load initial search query if redirected from Hero
  const initialSearch = searchParams.get("search") || "";

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Synchronize state with search query param changes (e.g. from hero redirect)
  useEffect(() => {
    const q = searchParams.get("search") || "";
    setSearch(q);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    fetchRecipes();
  }, [selectedCategories, selectedCuisine, selectedDifficulty, page, searchParams]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const categoryQuery = selectedCategories.join(",");
      const searchQuery = searchParams.get("search") || "";
      
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.set("search", searchQuery);
      if (categoryQuery) queryParams.set("category", categoryQuery);
      if (selectedCuisine) queryParams.set("cuisine", selectedCuisine);
      if (selectedDifficulty) queryParams.set("difficulty", selectedDifficulty);
      queryParams.set("page", page.toString());
      queryParams.set("limit", "8");

      const res = await fetch(`/api/recipes?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.recipes);
        setTotalPages(data.pages);
        setTotalCount(data.total);
      }
    } catch (err) {
      console.error("Failed to load recipes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (search.trim()) {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    router.push(`/recipes?${params.toString()}`);
  };

  const toggleCategory = (category) => {
    setPage(1);
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedCuisine("");
    setSelectedDifficulty("");
    setPage(1);
    router.push("/recipes");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-grow flex flex-col">
      <div className="flex flex-col gap-8 md:flex-row md:items-start flex-grow">
        
        {/* SIDEBAR FILTERS (Desktop) */}
        <aside className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-6">
            <h2 className="text-md font-bold flex items-center gap-2 text-zinc-800 dark:text-zinc-100">
              <Filter className="h-4.5 w-4.5 text-emerald-500" /> Filters
            </h2>
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              Reset All
            </button>
          </div>

          <div className="space-y-6">
            {/* Category Filter ($in mapping) */}
            <div>
              <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-3 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" /> Category
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {CATEGORIES.map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <label key={cat} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCategory(cat)}
                        className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 dark:border-zinc-700 dark:bg-zinc-800"
                      />
                      <span className={isChecked ? "font-semibold text-emerald-600 dark:text-emerald-400" : ""}>{cat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Cuisine Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-3">Cuisine</h3>
              <select
                value={selectedCuisine}
                onChange={(e) => {
                  setPage(1);
                  setSelectedCuisine(e.target.value);
                }}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
              >
                <option value="">All Cuisines</option>
                {CUISINES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-3">Difficulty</h3>
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setPage(1);
                  setSelectedDifficulty(e.target.value);
                }}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </aside>

        {/* RECIPES CONTENT GRID */}
        <section className="flex-1 flex flex-col gap-6 w-full">
          
          {/* Top Bar (Search & Stats) */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
            <form onSubmit={handleSearchSubmit} className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950">
              <Search className="h-4.5 w-4.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search recipe title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                    const params = new URLSearchParams(searchParams);
                    params.delete("search");
                    router.push(`/recipes?${params.toString()}`);
                  }}
                  className="text-2xs font-semibold text-zinc-400 hover:text-zinc-600"
                >
                  Clear
                </button>
              )}
            </form>

            <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap pl-2">
              Found <span className="text-zinc-800 dark:text-white font-bold">{totalCount}</span> recipes
            </div>
          </div>

          {/* Recipes Listing */}
          {loading ? (
            // SKELETON LOADER
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 flex-grow">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-80 rounded-2xl border border-zinc-200 bg-white p-5 space-y-4 dark:border-zinc-800 dark:bg-zinc-900 animate-pulse">
                  <div className="aspect-video w-full rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-6 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-4 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-4 w-1/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : recipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-grow py-20 bg-white border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-3xl text-center px-4">
              <Layers className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
              <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300">No recipes matched</h3>
              <p className="text-sm text-zinc-450 dark:text-zinc-500 mt-1 max-w-xs">
                Try widening your search terms, modifying your filters, or resetting categories.
              </p>
              <button
                onClick={resetFilters}
                className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-500"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            // RECIPE CARDS
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recipes.map((recipe) => (
                <div
                  key={recipe._id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-300"
                >
                  <Link href={`/recipes/${recipe._id}`} className="flex flex-col flex-1">
                    <div className="relative aspect-video w-full overflow-hidden bg-zinc-150">
                      <img
                        src={recipe.recipeImage}
                        alt={recipe.recipeName}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {recipe.price > 0 && (
                        <div className="absolute top-3 left-3 rounded-lg bg-amber-500/90 backdrop-blur px-2.5 py-1 text-2xs font-bold text-white shadow-sm">
                          Paid Recipe • ${recipe.price.toFixed(2)}
                        </div>
                      )}
                      {recipe.isFeatured && (
                        <div className="absolute top-3 right-3 rounded-lg bg-emerald-600/90 backdrop-blur px-2.5 py-1 text-2xs font-bold text-white shadow-sm uppercase tracking-wider">
                          Featured
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-2xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                          <span>{recipe.category}</span>
                          <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                          <span>{recipe.cuisineType}</span>
                        </div>
                        <h3 className="mt-2 text-base font-bold text-zinc-800 dark:text-zinc-100 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 leading-snug">
                          {recipe.recipeName}
                        </h3>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                        <span className="flex items-center gap-1 font-medium text-red-500">
                          <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" /> {recipe.likesCount || 0} Likes
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {recipe.preparationTime} mins
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                      isCurrent
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                        : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:hover:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}

        </section>

      </div>
    </div>
  );
}
