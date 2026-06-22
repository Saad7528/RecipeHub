"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Heart, Star, Flag, Clock, Award, ShieldAlert, Check, ShoppingBag, Loader2, ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

export default function RecipeDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Modals and notifications
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("Spam");
  const [reportLoading, setReportLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  useEffect(() => {
    fetchRecipeDetails();
    if (user) {
      checkIfFavorited();
    }
  }, [id, user]);

  const fetchRecipeDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/recipes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRecipe(data.recipe);
        setIsLocked(data.isLocked);
        setLikeCount(data.recipe.likesCount || 0);
      } else {
        router.push("/404");
      }
    } catch (err) {
      console.error("Error loading recipe", err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorited = async () => {
    try {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        const found = data.recipes.some((r) => r._id === id);
        setIsFavorited(found);
      }
    } catch (err) {
      console.error("Error checking favorites", err);
    }
  };

  const handleLike = async () => {
    if (!user) {
      router.push(`/login?redirect=/recipes/${id}`);
      return;
    }
    if (isLiked) return; // Prevent multiple likes in session

    try {
      const res = await fetch(`/api/recipes/${id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLikeCount(data.likesCount);
        setIsLiked(true);
      }
    } catch (err) {
      console.error("Error liking recipe", err);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      router.push(`/login?redirect=/recipes/${id}`);
      return;
    }

    try {
      const method = isFavorited ? "DELETE" : "POST";
      const url = isFavorited ? `/api/favorites/${id}` : "/api/favorites";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: isFavorited ? null : JSON.stringify({ recipeId: id }),
      });

      if (res.ok) {
        setIsFavorited(!isFavorited);
        showFeedback(isFavorited ? "Removed from Favorites" : "Added to Favorites");
      }
    } catch (err) {
      console.error("Error updating favorite", err);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/recipes/${id}`);
      return;
    }

    try {
      setReportLoading(true);
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: id, reason: reportReason }),
      });

      if (res.ok) {
        setIsReportModalOpen(false);
        showFeedback("Recipe reported. Admin will review this.");
      } else {
        const data = await res.json();
        alert(data.error || "Report failed");
      }
    } catch (err) {
      console.error("Error reporting recipe", err);
    } finally {
      setReportLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      router.push(`/login?redirect=/recipes/${id}`);
      return;
    }

    try {
      setPurchaseLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "recipe", recipeId: id }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to initiate purchase session. Please try again.");
      }
    } catch (err) {
      console.error("Purchase error", err);
    } finally {
      setPurchaseLoading(false);
    }
  };

  const showFeedback = (msg) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-40">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center">
        <h2 className="text-xl font-bold text-zinc-700">Recipe not found</h2>
        <Link href="/recipes" className="mt-4 text-emerald-600 font-semibold hover:underline">
          Go back to browse
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 flex-grow">
      
      {/* Toast Alert */}
      {feedbackMsg && (
        <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-xl dark:bg-emerald-600 animate-bounce flex items-center gap-2">
          <Check className="h-4.5 w-4.5" /> {feedbackMsg}
        </div>
      )}

      {/* Back button */}
      <Link href="/recipes" className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-emerald-600 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Browse
      </Link>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Banner Image */}
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-zinc-150">
          <img
            src={recipe.recipeImage}
            alt={recipe.recipeName}
            className="h-full w-full object-cover"
          />
          {recipe.isFeatured && (
            <div className="absolute top-4 left-4 rounded-xl bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow uppercase tracking-wider">
              Featured Recipe
            </div>
          )}
        </div>

        {/* Recipe Body Info */}
        <div className="p-8">
          
          {/* Tags & Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-2xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              <span>{recipe.category}</span>
              <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
              <span>{recipe.cuisineType}</span>
            </div>

            {/* Interaction Row */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                disabled={isLiked}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                  isLiked
                    ? "bg-red-50 text-red-500 border-red-200 dark:bg-red-950/20 dark:border-red-900/50"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-red-950/20 dark:hover:text-red-400"
                }`}
              >
                <Heart className={`h-4.5 w-4.5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                <span>{likeCount} Likes</span>
              </button>

              <button
                onClick={handleFavorite}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                  isFavorited
                    ? "bg-amber-50 text-amber-500 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-amber-50 hover:text-amber-500 hover:border-amber-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-amber-950/20 dark:hover:text-amber-400"
                }`}
              >
                <Star className={`h-4.5 w-4.5 ${isFavorited ? "fill-amber-500 text-amber-500" : ""}`} />
                <span>{isFavorited ? "Favorited" : "Favorite"}</span>
              </button>

              <button
                onClick={() => {
                  if (!user) router.push(`/login?redirect=/recipes/${id}`);
                  else setIsReportModalOpen(true);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-400 hover:bg-zinc-50 hover:text-red-500 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
                title="Report Recipe"
              >
                <Flag className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h1 className="mt-4 text-3xl font-extrabold text-zinc-900 dark:text-white leading-tight">
            {recipe.recipeName}
          </h1>

          {/* Author Details */}
          <div className="mt-4 flex items-center gap-3 border-b border-zinc-100 pb-6 dark:border-zinc-800">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold dark:bg-emerald-950/40 dark:text-emerald-400">
              {recipe.authorName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                {recipe.authorName}
                {recipe.authorEmail === user?.email && (
                  <span className="text-3xs bg-zinc-100 dark:bg-zinc-800 text-zinc-550 dark:text-zinc-400 font-medium px-1.5 py-0.5 rounded-md">Author</span>
                )}
              </p>
              <p className="text-xs text-zinc-400">{recipe.authorEmail}</p>
            </div>
          </div>

          {/* Meta Specifications */}
          <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900/50 sm:grid-cols-3">
            <div className="text-center">
              <span className="text-2xs font-semibold text-zinc-400 uppercase tracking-wider block">Preparation Time</span>
              <span className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                <Clock className="h-4 w-4 text-emerald-500" /> {recipe.preparationTime} mins
              </span>
            </div>
            <div className="text-center border-x border-zinc-200 dark:border-zinc-800">
              <span className="text-2xs font-semibold text-zinc-400 uppercase tracking-wider block">Difficulty</span>
              <span className="mt-1 inline-flex items-center text-sm font-bold text-zinc-800 dark:text-zinc-200">
                {recipe.difficultyLevel}
              </span>
            </div>
            <div className="text-center col-span-2 sm:col-span-1">
              <span className="text-2xs font-semibold text-zinc-400 uppercase tracking-wider block">Cost Option</span>
              <span className="mt-1 inline-flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-450">
                {recipe.price > 0 ? `Premium ($${recipe.price.toFixed(2)})` : "Free Access"}
              </span>
            </div>
          </div>

          {/* LOCK OVERLAY IF LOCKED */}
          {isLocked ? (
            <div className="mt-10 relative overflow-hidden rounded-3xl border border-amber-250 bg-amber-50/50 p-8 text-center dark:border-amber-900/40 dark:bg-amber-950/10">
              <div className="flex flex-col items-center max-w-md mx-auto gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/30">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-800 dark:text-white">This Recipe is Locked</h3>
                <p className="text-sm text-zinc-550 dark:text-zinc-400 leading-relaxed">
                  This signature dish was published as a premium creation by <span className="font-semibold text-zinc-700 dark:text-zinc-200">{recipe.authorName}</span>. To view the complete ingredient list and step-by-step instructions, please buy it below.
                </p>
                <button
                  onClick={handlePurchase}
                  disabled={purchaseLoading}
                  className="mt-2 w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/10 hover:bg-emerald-500 flex items-center justify-center gap-2"
                >
                  {purchaseLoading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" /> Preparing checkout...
                    </>
                  ) : (
                    <>Purchase Recipe for ${recipe.price.toFixed(2)}</>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // UNLOCKED VIEW: INGREDIENTS & INSTRUCTIONS
            <div className="mt-10 space-y-10">
              
              {/* Ingredients */}
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Ingredients</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                      <div className="mt-0.5 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Instructions</h2>
                <div className="whitespace-pre-line text-sm text-zinc-750 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-900/30 p-6 rounded-2xl border border-zinc-150 dark:border-zinc-800">
                  {recipe.instructions}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2.5 text-red-500 font-bold border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <ShieldAlert className="h-5 w-5" />
              <h3>Report Recipe</h3>
            </div>
            
            <form onSubmit={handleReport} className="mt-4 space-y-4">
              <p className="text-xs text-zinc-400">
                Please help us keep RecipeHub safe and respectful. Select the primary reason for reporting this recipe.
              </p>
              
              <div className="space-y-2">
                {["Spam", "Offensive Content", "Copyright Issue"].map((reason) => (
                  <label key={reason} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={reportReason === reason}
                      onChange={() => setReportReason(reason)}
                      className="text-emerald-600 focus:ring-emerald-500 h-4 w-4 dark:bg-zinc-800"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reportLoading}
                  className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-red-500 flex items-center gap-1"
                >
                  {reportLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" /> Submit Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
