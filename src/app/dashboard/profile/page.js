"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Upload, Check, Loader2, Award } from "lucide-react";

export default function ProfileSettings() {
  const { user, updateProfileState } = useAuth();
  
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    document.title = "Profile Settings | RecipeHub";
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setImagePreview(user.image || "");
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadToImgbb = async (file) => {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      throw new Error("ImgBB API Key is not configured");
    }

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error?.message || "Failed to upload image");
    }

    return data.data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Name is required");

    try {
      setUpdating(true);
      let uploadedUrl = user.image;

      if (imageFile) {
        setUploadingImage(true);
        uploadedUrl = await uploadToImgbb(imageFile);
        setUploadingImage(false);
      }

      const res = await fetch("/api/dashboard/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: uploadedUrl }),
      });

      const data = await res.json();
      if (res.ok) {
        // Sync to context
        updateProfileState(data.user);
        showToast("Profile updated successfully!");
        setImageFile(null);
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setUpdating(false);
      setUploadingImage(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <div className="space-y-6 max-w-xl">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-xl dark:bg-emerald-600 animate-bounce flex items-center gap-2">
          <Check className="h-4.5 w-4.5" /> {toastMsg}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">Profile Settings</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Update your public credentials and culinary avatar.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Avatar Upload Container */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
              <img
                src={imagePreview || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                alt="Avatar Preview"
                className="h-full w-full object-cover"
              />
              {user?.isPremium && (
                <div className="absolute bottom-0 right-0 rounded-full bg-amber-500 p-1 text-white border-2 border-white dark:border-zinc-900">
                  <Award className="h-3 w-3 fill-white" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="relative inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-350 cursor-pointer shadow-sm">
                <Upload className="h-3.5 w-3.5" />
                <span>Upload New Avatar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-3xs text-zinc-400">Supports JPG, PNG, GIF. Max 5MB file sizes.</p>
            </div>
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">Registered Email</label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-450 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-950"
            />
            <span className="text-3xs text-zinc-400 mt-1 block">Account emails cannot be changed once registered.</span>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={updating}
            className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/10 hover:bg-emerald-500 flex items-center justify-center gap-2 disabled:opacity-85"
          >
            {updating ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
                {uploadingImage ? "Uploading Image..." : "Saving Profile..."}
              </>
            ) : (
              <>
                <Check className="h-4.5 w-4.5" /> Save Changes
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
