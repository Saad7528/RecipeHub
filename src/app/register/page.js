"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Upload, Compass, Loader2, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Avatar upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
      throw new Error(data.error?.message || "Failed to upload avatar");
    }

    return data.data.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name || !email || !password) {
      setErrorMsg("All fields are required");
      return;
    }

    // Password validation rules: Minimum 6 characters, one uppercase, one lowercase
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long");
      return;
    }
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    if (!hasUppercase || !hasLowercase) {
      setErrorMsg("Password must contain at least one uppercase and one lowercase letter");
      return;
    }

    try {
      setLoading(true);
      let avatarUrl = "";

      if (imageFile) {
        setUploadingImage(true);
        avatarUrl = await uploadToImgbb(imageFile);
        setUploadingImage(false);
      }

      const result = await register(name, email, password, avatarUrl, "/dashboard");
      
      if (result.success) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } else {
        setErrorMsg(result.error || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to complete registration");
      setUploadingImage(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-grow items-center justify-center py-16 px-4 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 mb-4">
            <Compass className="h-6 w-6" />
          </Link>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Create account</h2>
          <p className="mt-2 text-xs text-zinc-455 dark:text-zinc-500">Sign up and join the recipe sharing community</p>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-150 p-4 dark:bg-red-950/20 dark:border-red-900/50 flex items-start gap-2.5">
            <AlertCircle className="h-4.5 w-4.5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-400 font-semibold">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Avatar upload */}
          <div className="flex items-center gap-4 border-b border-zinc-100 pb-4 mb-2 dark:border-zinc-800">
            <div className="h-14 w-14 overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
              <img
                src={imagePreview || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                alt="Avatar Preview"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="relative inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-350 cursor-pointer shadow-sm">
              <Upload className="h-3.5 w-3.5" />
              <span>Choose Profile Pic</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-3xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">Full Name</label>
            <div className="relative flex items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950">
              <User className="h-4 w-4 text-zinc-400 mr-2" />
              <input
                type="text"
                placeholder="Elena Rostova"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent text-sm outline-none text-zinc-800 dark:text-zinc-150"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-3xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">Email Address</label>
            <div className="relative flex items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950">
              <Mail className="h-4 w-4 text-zinc-400 mr-2" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm outline-none text-zinc-800 dark:text-zinc-150"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-3xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">Password</label>
            <div className="relative flex items-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-950">
              <Lock className="h-4 w-4 text-zinc-400 mr-2" />
              <input
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm outline-none text-zinc-800 dark:text-zinc-150"
              />
            </div>
            <span className="text-3xs text-zinc-400 mt-1 block">
              At least 6 characters, including 1 uppercase & 1 lowercase letter.
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/10 hover:bg-emerald-500 flex items-center justify-center gap-2 disabled:opacity-85"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploadingImage ? "Uploading Image..." : "Creating Account..."}
              </>
            ) : (
              <>
                Sign Up
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-emerald-600 hover:underline dark:text-emerald-450">
            Log in
          </Link>
        </p>

      </div>
    </div>
  );
}
