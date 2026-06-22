"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Trash2, Edit2, Star, Eye, X, Plus, Loader2 } from "lucide-react";

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snacks", "Beverages", "Soup", "Salad"];
const CUISINES = ["Italian", "Mexican", "Indian", "Chinese", "American", "Japanese", "French", "Thai", "Mediterranean", "Other"];

export default function ManageRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");

  // Edit modal state (similar to user dashboard edit modal)
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

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/recipes");
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.recipes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Manage Recipes | RecipeHub";
    setTimeout(() => {
      fetchRecipes();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this recipe? This action is permanent and cannot be undone.")) return;

    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRecipes(recipes.filter((r) => r._id !== id));
        showToast("Recipe deleted successfully");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFeature = async (recipeId, currentFeatured) => {
    try {
      const nextFeatured = !currentFeatured;
      const res = await fetch("/api/admin/recipes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId, isFeatured: nextFeatured }),
      });

      if (res.ok) {
        setRecipes(recipes.map((r) => (r._id === recipeId ? { ...r, isFeatured: nextFeatured } : r)));
        showToast(nextFeatured ? "Added to Featured section" : "Removed from Featured section");
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
        setRecipes(recipes.map((r) => (r._id === editingRecipe._id ? data.recipe : r)));
        closeEditModal();
        showToast("Recipe updated successfully");
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
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-xl dark:bg-purple-655 animate-bounce">
          {toastMsg}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Manage Recipes</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">View all uploaded recipes, edit/delete details, or toggle featured showcases.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-zinc-500">
            <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-400 dark:bg-zinc-950 dark:border-zinc-800 border-b border-zinc-150">
              <tr>
                <th className="px-6 py-4">Recipe Title</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Cuisine</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {recipes.map((r) => (
                <tr key={r._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                  <td className="flex items-center gap-3 px-6 py-4 font-semibold text-zinc-800 dark:text-zinc-150">
                    <img src={r.recipeImage} alt={r.recipeName} className="h-8 w-8 rounded-lg object-cover" />
                    <span className="truncate max-w-[150px]">{r.recipeName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-zinc-700 dark:text-zinc-200">{r.authorName}</div>
                    <div className="text-3xs text-zinc-400">{r.authorEmail}</div>
                  </td>
                  <td className="px-6 py-4">{r.category}</td>
                  <td className="px-6 py-4">{r.cuisineType}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-450">
                    {r.price > 0 ? `$${r.price.toFixed(2)}` : "Free"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleFeature(r._id, r.isFeatured)}
                      className={`inline-flex items-center gap-1 rounded px-2.5 py-1 text-2xs font-extrabold uppercase tracking-widest transition-all ${
                        r.isFeatured
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-850 dark:text-zinc-450 hover:bg-amber-50"
                      }`}
                    >
                      <Star className={`h-3 w-3 ${r.isFeatured ? "fill-amber-500 text-amber-500" : ""}`} />
                      {r.isFeatured ? "Featured" : "Feature"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/recipes/${r._id}`}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-55 text-zinc-650 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => openEditModal(r)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-55 text-zinc-650 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
              <h3 className="text-md font-bold text-zinc-800 dark:text-white flex items-center gap-1.5">
                <Edit2 className="h-4.5 w-4.5 text-emerald-500" /> Edit Recipe (Admin)
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
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-150"
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
                  <label className="text-2xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Recipe Pricing (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-150 text-emerald-600 font-bold"
                  />
                </div>

                {/* Ingredients */}
                <div>
                  <label className="text-2xs font-bold uppercase tracking-wider text-zinc-400 block mb-1">Ingredients</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Add ingredient..."
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
                        <button type="button" onClick={() => handleRemoveIngredient(idx)} className="text-zinc-400 hover:text-zinc-600">
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
                    <>Save Changes</>
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
