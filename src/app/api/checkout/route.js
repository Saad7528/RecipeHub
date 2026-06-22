import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db";
import Recipe from "@/models/Recipe";
import { verifyToken } from "@/lib/jwt";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
let stripe = null;
if (STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.startsWith("your_")) {
  stripe = new Stripe(STRIPE_SECRET_KEY);
}

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, recipeId } = await req.json();
    if (!type || !["premium", "recipe"].includes(type)) {
      return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
    }

    await dbConnect();
    let amount = 0;
    let title = "";

    if (type === "premium") {
      amount = 19.99;
      title = "RecipeHub Premium Membership";
    } else {
      if (!recipeId) {
        return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 });
      }
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
      }
      if (recipe.price <= 0) {
        return NextResponse.json({ error: "Recipe is free" }, { status: 400 });
      }
      amount = recipe.price;
      title = `Purchase Recipe: ${recipe.recipeName}`;
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // IF STRIPE KEY IS NOT PROVIDED, FALL BACK TO MOCK TEST MODE
    if (!stripe) {
      console.warn("Stripe Secret Key missing/placeholder. Falling back to Mock checkout mode.");
      const mockSessionId = `mock_session_${Math.random().toString(36).substring(2, 15)}`;
      const successUrl = `${origin}/payment/success?session_id=${mockSessionId}&type=${type}&recipeId=${recipeId || ""}&amount=${amount}`;
      return NextResponse.json({ url: successUrl });
    }

    // Real Stripe Session Creation
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: title,
              description: type === "premium" ? "Unlocks unlimited uploads and Premium Profile badge" : "Instant access to ingredient list and guidelines",
            },
            unit_amount: Math.round(amount * 100), // in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        type,
        userId: payload.userId,
        userEmail: payload.email,
        recipeId: recipeId || "",
        amount: amount.toString(),
      },
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: type === "premium" ? `${origin}/dashboard` : `${origin}/recipes/${recipeId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
