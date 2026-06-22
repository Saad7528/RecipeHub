"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Edit2, Trash2, Clock, Eye, AlertCircle, Loader2, X, Plus, Sparkles } from "lucide-react";

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snacks", "Beverages", "Soup", "Salad"];
const CUISINES = ["Italian", "Mexican", "Indian", "Chinese", "American", "Japanese", "French", "Thai", "Mediterranean", "Other"];

export default function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Edit modal state
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editCuisine, setEditCuisine] = useState("");
  const [editDifficulty, setEditDifficulty] = useState("");
  const [editPrepTime, setEditPrepTime] = useState("");
  const [editPrice, setEditPrice] = useState("0");
  const [editIngredients, setEditIngredients] = useState([]);
  const [editCurrentIng, setEditCurrentIng] = useState("");
  const [editInstructions, setEditInstructions] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchMyRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/my-recipes");
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.recipes);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load recipes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "My Recipes | RecipeHub";
    setTimeout(() => {
      fetchMyRecipes();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this recipe? This action is permanent.")) return;

    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRecipes(recipes.filter((r) => r._id !== id));
        showToast("Recipe deleted successfully");
      } else {
        alert("Failed to delete recipe");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (recipe) => {
    setEditingRecipe(recipe);
    setEditName(recipe.recipeName);
    setEditCategory(recipe.category);
    setEditCuisine(recipe.cuisineType);
    setEditDifficulty(recipe.difficultyLevel);
    setEditPrepTime(recipe.preparationTime.toString());
    setEditPrice(recipe.price.toString());
    setEditIngredients(recipe.ingredients || []);
    setEditInstructions(recipe.instructions);
  };

  const closeEditModal = () => {
    setEditingRecipe(null);
  };

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (editCurrentIng.trim()) {
      if (!editIngredients.includes(editCurrentIng.trim())) {
        setEditIngredients([...editIngredients, editCurrentIng.trim()]);
      }
      setEditCurrentIng("");
    }
  };

  const handleRemoveIngredient = (index) => {
    setEditIngredients(editIngredients.filter((_, idx) => idx !== index));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return alert("Recipe title is required");
    if (!editPrepTime || Number(editPrepTime) <= 0) return alert("Valid preparation time is required");
    if (editIngredients.length === 0) return alert("Please specify at least one ingredient");
    if (!editInstructions.trim()) return alert("Instructions are required");

    try {
      setEditSubmitting(true);
      const res = await fetch(`/api/recipes/${editingRecipe._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeName: editName,
          category: editCategory,
          cuisineType: editCuisine,
          difficultyLevel: editDifficulty,
          preparationTime: Number(editPrepTime),
          ingredients: editIngredients,
          instructions: editInstructions,
          price: Number(editPrice),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state
        setRecipes(recipes.map((r) => (r._id === editingRecipe._id ? data.recipe : r)));
        closeEditModal();
        showToast("Recipe updated successfully");
      } else {
        const data = await res.json();
        alert(data.error || "Update failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEditSubmitting(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-xl dark:bg-emerald-600 animate-bounce">
          {toastMsg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">My Recipes</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Manage recipes you have uploaded to the platform.</p>
        </div>
        <Link
          href="/dashboard/add-recipe"
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/10 hover:bg-emerald-500 flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add Recipe
        </Link>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-3xl text-center px-4">
          <BookOpen className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
          <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300">No recipes posted</h3>
          <p className="text-sm text-zinc-450 dark:text-zinc-550 mt-1 max-w-xs">
            Start sharing your recipes with the community now!
          </p>
          <Link
            href="/dashboard/add-recipe"
            className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-500"
          >
            Create First Recipe
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
                  {recipe.price > 0 && (
                    <div className="absolute top-3 left-3 rounded-lg bg-amber-500/90 px-2 py-0.5 text-2xs font-bold text-white">
                      Paid • ${recipe.price.toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-2xs font-semibold text-emerald-600 uppercase tracking-wider">
                    <span>{recipe.category}</span>
                    <span className="text-zinc-300 dark:text-zinc-750">&bull;</span>
                    <span>{recipe.cuisineType}</span>
                  </div>
                  <h3 className="mt-2 text-base font-bold text-zinc-800 dark:text-zinc-100 line-clamp-1">{recipe.recipeName}</h3>
                  <div className="mt-4 flex items-center gap-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {recipe.preparationTime} min</span>
                    <span>{recipe.likesCount} likes</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex border-t border-zinc-100 dark:border-zinc-800 p-3 gap-2 bg-zinc-50/50 dark:bg-zinc-900/20">
                <Link
                  href={`/recipes/${recipe._id}`}
                  className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-white border border-zinc-200 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-350 dark:hover:bg-zinc-900"
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </Link>
                <button
                  onClick={() => openEditModal(recipe)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-white border border-zinc-200 py-2 text-xs font-semibold text-zinc-650 hover:bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-350 dark:hover:bg-zinc-900"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(recipe._id)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT RECIPE MODAL */}
      {editingRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h3 className="text-md font-bold text-zinc-800 dark:text-white flex items-center gap-1.5">
                <Edit2 className="h-4.5 w-4.5 text-emerald-500" /> Edit Recipe
              </h3>
              <button onClick={closeEditModal} className="text-zinc-400 hover:text-zinc-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4 overflow-y-auto pr-2 flex-grow">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-2xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Recipe Title</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/25 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-150"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="text-2xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-150"
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {/* Cuisine */}
                  <div>
                    <label className="text-2xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Cuisine</label>
                    <select
                      value={editCuisine}
                      onChange={(e) => setEditCuisine(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-150"
                    >
                      {CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {/* Difficulty */}
                  <div>
                    <label className="text-2xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Difficulty</label>
                    <select
                      value={editDifficulty}
                      onChange={(e) => setEditDifficulty(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-150"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  {/* Prep Time */}
                  <div>
                    <label className="text-2xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Prep Time (mins)</label>
                    <input
                      type="number"
                      value={editPrepTime}
                      onChange={(e) => setEditPrepTime(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-150"
                    />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="text-2xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Recipe Pricing (USD - set to 0 for free)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-150 text-emerald-600 font-bold"
                  />
                </div>

                {/* Ingredients tag editor */}
                <div>
                  <label className="text-2xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Ingredients</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add an ingredient..."
                      value={editCurrentIng}
                      onChange={(e) => setEditCurrentIng(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddIngredient(e)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddIngredient}
                      className="rounded-xl bg-zinc-800 text-white px-3 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {editIngredients.map((ing, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                        {ing}
                        <button type="button" onClick={() => handleRemoveIngredient(idx)} className="text-zinc-400 hover:text-zinc-650">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className="text-2xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Instructions</label>
                  <textarea
                    rows={4}
                    value={editInstructions}
                    onChange={(e) => setEditInstructions(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-150 leading-relaxed whitespace-pre-wrap"
                  />
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 flex items-center gap-1"
                >
                  {editSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" /> Save Changes
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
