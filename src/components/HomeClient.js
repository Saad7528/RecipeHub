"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Clock, Flame, ShieldCheck, Heart, Award, ArrowRight, Star, Users, Sparkles, BookOpen } from "lucide-react";

export default function HomeClient({ featuredRecipes = [], popularRecipes = [] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  useEffect(() => {
    document.title = "Home | RecipeHub";
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/recipes?search=${encodeURIComponent(search.trim())}`);
    }
  };

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="flex flex-col gap-20 pb-20">
      
      {/* 1. HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-24 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950/20">
        <div className="absolute inset-0 opacity-40 dark:opacity-20">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-emerald-300 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-teal-300 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={heroVariants}
            className="flex flex-col items-center gap-6"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Sparkles className="h-3 w-3 animate-spin" /> Share, Discover & Cook
            </span>

            <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-6xl md:text-7xl">
              Elevate Your Cooking with{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
                RecipeHub
              </span>
            </h1>

            <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              Join a community of home chefs. Discover hand-picked culinary delights, post your unique dishes, and connect with global food enthusiasts.
            </p>

            {/* Search Bar Form */}
            <form onSubmit={handleSearch} className="mt-4 flex w-full max-w-lg items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-xl focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-1 items-center gap-2 px-2">
                <Search className="h-5 w-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search recipes, cuisines, categories..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-500"
              >
                Search
              </button>
            </form>

            <div className="mt-4 flex gap-4">
              <Link
                href="/recipes"
                className="group flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400"
              >
                Browse all recipes <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURED RECIPES SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Featured Recipes</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Hand-picked premium recipes recommended by our editors</p>
          </div>
          <Link href="/recipes" className="text-sm font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400">
            View All
          </Link>
        </div>

        {featuredRecipes.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-400">No featured recipes available right now.</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {featuredRecipes.map((recipe) => (
              <motion.div
                key={recipe._id}
                variants={itemVariants}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-300"
              >
                <Link href={`/recipes/${recipe._id}`} className="block">
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
                    <img
                      src={recipe.recipeImage}
                      alt={recipe.recipeName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 rounded-lg bg-emerald-600/90 backdrop-blur px-2.5 py-1 text-2xs font-bold text-white uppercase tracking-wider">
                      Featured
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-2xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      <span>{recipe.category}</span>
                      <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                      <span>{recipe.cuisineType}</span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-zinc-800 dark:text-zinc-100 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {recipe.recipeName}
                    </h3>
                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {recipe.preparationTime} mins
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-2xs font-medium ${
                        recipe.difficultyLevel === "Easy" ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" :
                        recipe.difficultyLevel === "Medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" :
                        "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                      }`}>
                        {recipe.difficultyLevel}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* 3. POPULAR RECIPES SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Popular Recipes</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Most-liked recipes shared by our amazing community</p>
        </div>

        {popularRecipes.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-400">No recipes found. Be the first to add one!</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {popularRecipes.map((recipe) => (
              <motion.div
                key={recipe._id}
                variants={itemVariants}
                className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-300"
              >
                <Link href={`/recipes/${recipe._id}`} className="block">
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
                    <img
                      src={recipe.recipeImage}
                      alt={recipe.recipeName}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {recipe.price > 0 && (
                      <div className="absolute top-3 left-3 rounded-lg bg-amber-500/90 backdrop-blur px-2.5 py-1 text-2xs font-bold text-white">
                        ${recipe.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-2xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      <span>{recipe.category}</span>
                      <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
                      <span>By {recipe.authorName}</span>
                    </div>
                    <h3 className="mt-2 text-base font-bold text-zinc-800 dark:text-zinc-100 line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {recipe.recipeName}
                    </h3>
                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                      <span className="flex items-center gap-1 font-medium text-red-500">
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" /> {recipe.likesCount || 0} Likes
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {recipe.preparationTime} mins
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* 4. EXTRA STATIC SECTION 1: CULINARY HIGHLIGHTS */}
      <section className="bg-zinc-100 py-20 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Why Join RecipeHub?</h2>
            <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
              Our platform offers chefs and cooking lovers the tools they need to share, monetize, and appreciate amazing food.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center p-6 text-center bg-white rounded-2xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <BookOpen className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-zinc-800 dark:text-white">Learn and Cook</h3>
              <p className="mt-2.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Unlock specialized, high-tier signature recipes from certified home chefs and global cuisine masters.
              </p>
            </div>

            <div className="flex flex-col items-center p-6 text-center bg-white rounded-2xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <Award className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-zinc-800 dark:text-white">Go Premium</h3>
              <p className="mt-2.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Upgrade to premium for a verified badge and unlimited recipe posts to build your unique culinary portfolio.
              </p>
            </div>

            <div className="flex flex-col items-center p-6 text-center bg-white rounded-2xl shadow-sm border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-zinc-800 dark:text-white">Secure Stripe Checkouts</h3>
              <p className="mt-2.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Enjoy hassle-free payment verification via Stripe for premium updates and recipe acquisitions.
              </p>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 text-center md:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">12k+</div>
              <div className="mt-1 text-xs font-semibold uppercase text-zinc-400 tracking-wider">Recipes Posted</div>
            </div>
            <div className="rounded-2xl bg-white p-6 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">45k+</div>
              <div className="mt-1 text-xs font-semibold uppercase text-zinc-400 tracking-wider">Happy Chefs</div>
            </div>
            <div className="rounded-2xl bg-white p-6 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">800k+</div>
              <div className="mt-1 text-xs font-semibold uppercase text-zinc-400 tracking-wider">Likes Given</div>
            </div>
            <div className="rounded-2xl bg-white p-6 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
              <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">180+</div>
              <div className="mt-1 text-xs font-semibold uppercase text-zinc-400 tracking-wider">Countries Covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EXTRA STATIC SECTION 2: CHEF SPOTLIGHT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 to-zinc-950 p-8 text-white md:p-16 shadow-xl">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative grid grid-cols-1 gap-10 md:grid-cols-12 items-center">
            
            <div className="md:col-span-4 relative aspect-[4/5] w-full overflow-hidden rounded-2xl border-4 border-emerald-800/40 bg-zinc-800">
              <img
                src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600"
                alt="Chef of the month"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-emerald-600 px-3 py-1 rounded-lg text-2xs font-bold uppercase tracking-wider">
                Chef Spotlight
              </div>
            </div>

            <div className="md:col-span-8 space-y-6">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="h-4.5 w-4.5 fill-amber-400" />
                <Star className="h-4.5 w-4.5 fill-amber-400" />
                <Star className="h-4.5 w-4.5 fill-amber-400" />
                <Star className="h-4.5 w-4.5 fill-amber-400" />
                <Star className="h-4.5 w-4.5 fill-amber-400" />
                <span className="ml-1 text-xs font-bold text-zinc-300">5.0 Star Chef</span>
              </div>
              <h2 className="text-3xl font-extrabold md:text-4xl">Chef Raymond Vance</h2>
              <p className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">Pastry Artist & Culinary Innovator</p>
              
              <blockquote className="text-lg italic text-zinc-200 border-l-4 border-emerald-500 pl-4 leading-relaxed">
                &ldquo;Cooking isn't just about mixing ingredients; it's about translating memories and feelings onto a plate. RecipeHub connects me to thousands of people who share that exact same passion.&rdquo;
              </blockquote>

              <div className="flex flex-wrap gap-4 text-xs font-bold text-zinc-300">
                <span className="flex items-center gap-1"><Users className="h-4 w-4 text-emerald-400" /> 14.2k Followers</span>
                <span className="flex items-center gap-1"><Flame className="h-4 w-4 text-emerald-400" /> 35 Signature Recipes</span>
              </div>

              <div className="pt-2">
                <Link
                  href="/recipes"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-500 transition-colors shadow"
                >
                  Explore Vance's Pastries
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
