"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Upload, Loader2, Sparkles, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snacks", "Beverages", "Soup", "Salad"];
const CUISINES = ["Italian", "Mexican", "Indian", "Chinese", "American", "Japanese", "French", "Thai", "Mediterranean", "Other"];

export default function AddRecipe() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Add Recipe | RecipeHub";
  }, []);

  const [recipeName, setRecipeName] = useState("");
  const [category, setCategory] = useState("Breakfast");
  const [cuisineType, setCuisineType] = useState("Italian");
  const [difficultyLevel, setDifficultyLevel] = useState("Easy");
  const [preparationTime, setPreparationTime] = useState("");
  const [instructions, setInstructions] = useState("");
  const [price, setPrice] = useState("0");
  
  // Ingredients list state
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState("");

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (currentIngredient.trim()) {
      if (!ingredients.includes(currentIngredient.trim())) {
        setIngredients([...ingredients, currentIngredient.trim()]);
      }
      setCurrentIngredient("");
    }
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, idx) => idx !== index));
  };

  const uploadToImgbb = async (file) => {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      throw new Error("ImgBB API Key is not configured in environment variables");
    }

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error?.message || "Failed to upload image to ImgBB");
    }

    return data.data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!recipeName.trim()) return setErrorMsg("Recipe Name is required");
    if (!preparationTime || Number(preparationTime) <= 0) return setErrorMsg("Valid Preparation Time is required");
    if (ingredients.length === 0) return setErrorMsg("Please add at least one ingredient");
    if (!instructions.trim()) return setErrorMsg("Recipe Instructions are required");
    if (!imageFile) return setErrorMsg("Please upload a recipe image");

    try {
      setSubmitting(true);
      
      // 1. Upload image to ImgBB
      setUploadingImage(true);
      const imageUrl = await uploadToImgbb(imageFile);
      setUploadingImage(false);

      // 2. Submit recipe to database
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeName,
          recipeImage: imageUrl,
          category,
          cuisineType,
          difficultyLevel,
          preparationTime: Number(preparationTime),
          ingredients,
          instructions,
          price: Number(price),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create recipe");
      }

      // Success
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      router.push("/dashboard/my-recipes");
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
      setUploadingImage(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Create New Recipe</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Share your custom dish with our culinary community.</p>
      </div>

      {errorMsg && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 dark:bg-red-950/20 dark:border-red-900/50 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-800 dark:text-red-300">Could not submit recipe</h4>
            <p className="text-xs text-red-700 dark:text-red-400/90 mt-1">{errorMsg}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 md:grid-cols-3">
        
        {/* Form Details (Left side - Col span 2) */}
        <div className="md:col-span-2 space-y-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          
          {/* Recipe Name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 block mb-2">Recipe Title</label>
            <input
              type="text"
              placeholder="e.g. Classic Margherita Pizza"
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Category */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 block mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Cuisine */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 block mb-2">Cuisine Type</label>
              <select
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
              >
                {CUISINES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 block mb-2">Difficulty</label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Prep Time */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 block mb-2">Prep Time (minutes)</label>
              <input
                type="number"
                placeholder="e.g. 45"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Pricing Options */}
          <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 block mb-2">Pricing Option (USD)</label>
            <div className="flex gap-4">
              <label className="flex flex-1 items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="pricing"
                    checked={price === "0"}
                    onChange={() => setPrice("0")}
                    className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Free Access</span>
                </div>
              </label>
              <label className="flex flex-1 items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950 cursor-pointer">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="pricing"
                    checked={price !== "0"}
                    onChange={() => setPrice("2.99")}
                    className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Premium Locked</span>
                </div>
                {price !== "0" && (
                  <input
                    type="number"
                    step="0.01"
                    min="0.99"
                    value={price === "0" ? "2.99" : price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-20 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-bold text-right text-emerald-600 outline-none dark:border-zinc-800 dark:bg-zinc-900"
                  />
                )}
              </label>
            </div>
            <p className="text-3xs text-zinc-400 mt-2">
              If premium locked is active, other users must buy this recipe to view the ingredients and step instructions.
            </p>
          </div>

          {/* Ingredients list editor */}
          <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 block mb-2">Ingredients List</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. 2 cups of fresh mozzarella"
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddIngredient(e)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={handleAddIngredient}
                className="rounded-xl bg-zinc-800 text-white px-4 hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {ingredients.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No ingredients added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50"
                  >
                    {ing}
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 block mb-2">Instructions / Prep Steps</label>
            <textarea
              rows={6}
              placeholder="Describe step-by-step cooking procedures..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-850 outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 leading-relaxed whitespace-pre-wrap"
            />
          </div>

        </div>

        {/* Upload Thumbnail & Action Button (Right side - Col span 1) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 block mb-3">Recipe Thumbnail</label>
            
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 transition-all">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-zinc-400" />
                  <span className="text-xs font-semibold text-zinc-500">Click to upload file</span>
                </>
              )}
            </div>
            
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(""); }}
                className="mt-3 text-xs font-semibold text-red-500 hover:underline block"
              >
                Remove image
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/10 hover:bg-emerald-500 flex items-center justify-center gap-2 disabled:opacity-85"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                {uploadingImage ? "Uploading Image..." : "Publishing Recipe..."}
              </>
            ) : (
              <>
                <Sparkles className="h-4.5 w-4.5" /> Publish Recipe
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
