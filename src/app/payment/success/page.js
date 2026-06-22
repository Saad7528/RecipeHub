"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle, Loader2, ArrowRight, Award, Utensils } from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { checkSession } = useAuth();
  
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState("");
  const verifiedRef = useRef(false);

  const sessionId = searchParams.get("session_id");
  const type = searchParams.get("type");
  const recipeId = searchParams.get("recipeId");
  const amount = searchParams.get("amount");

  const verifyPayment = async () => {
    try {
      setVerifying(true);
      const res = await fetch("/api/checkout/success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          type,
          recipeId,
          amount,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setPaymentDetails(data.payment);
        
        // Refresh Auth Context to sync Premium Badge
        await checkSession();
        
        // Celebrate!
        triggerConfetti();
      } else {
        setError(data.error || "Payment verification failed");
      }
    } catch (err) {
      console.error(err);
      setError("Network error occurred during verification");
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    document.title = "Payment Success | RecipeHub";
  }, []);

  useEffect(() => {
    if (sessionId && !verifiedRef.current) {
      verifiedRef.current = true;
      setTimeout(() => {
        verifyPayment();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  if (verifying) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
        <p className="text-sm font-semibold text-zinc-500">Confirming your transaction, please wait...</p>
      </div>
    );
  }

  if (error || !success) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-32 px-4 text-center">
        <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-950/20">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-zinc-800 dark:text-zinc-100">Verification Issue</h2>
        <p className="mt-2 text-sm text-zinc-550 max-w-sm">{error || "Could not confirm payment session"}</p>
        <Link href="/dashboard" className="mt-8 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-emerald-500">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const isPremiumPayment = paymentDetails?.recipeId === null;

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-emerald-500 animate-pulse" />
        </div>

        <h1 className="mt-6 text-3xl font-extrabold text-zinc-900 dark:text-white">Payment Success!</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Thank you! Your transaction completed successfully and has been credited.
        </p>

        {/* Transaction Summary Card */}
        <div className="mt-8 rounded-2xl bg-zinc-50 p-5 text-left text-xs space-y-3 border border-zinc-100 dark:bg-zinc-950 dark:border-zinc-850">
          <div className="flex justify-between">
            <span className="font-semibold text-zinc-450 uppercase tracking-wider">Transaction Type</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-150">
              {isPremiumPayment ? "Premium Upgrade" : "Recipe Purchase"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-zinc-450 uppercase tracking-wider">Amount Paid</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-450">
              ${paymentDetails?.amount?.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-zinc-450 uppercase tracking-wider">Payment Status</span>
            <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-2xs font-bold text-green-700 dark:bg-green-950/40 dark:text-green-400 uppercase tracking-wider">
              Paid
            </span>
          </div>
          <div className="flex flex-col gap-1 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <span className="font-semibold text-zinc-450 uppercase tracking-wider">Transaction ID</span>
            <span className="font-mono text-3xs text-zinc-500 dark:text-zinc-400 select-all truncate block">
              {paymentDetails?.transactionId}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8">
          {isPremiumPayment ? (
            <Link
              href="/dashboard"
              className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/10 hover:bg-emerald-500 flex items-center justify-center gap-2"
            >
              <Award className="h-4.5 w-4.5" /> Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href={`/recipes/${paymentDetails?.recipeId}`}
              className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/10 hover:bg-emerald-500 flex items-center justify-center gap-2"
            >
              <Utensils className="h-4.5 w-4.5" /> View Unlocked Recipe <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
