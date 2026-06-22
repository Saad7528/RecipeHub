import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Payment from "@/models/Payment";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

let stripe = null;
if (STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.startsWith("your_")) {
  stripe = new Stripe(STRIPE_SECRET_KEY);
}

export async function POST(req) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    let event;

    if (STRIPE_WEBHOOK_SECRET) {
      try {
        event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
      }
    } else {
      event = JSON.parse(body);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      
      await dbConnect();
      
      const transactionId = session.id;
      
      // Check duplicate
      const alreadyPaid = await Payment.findOne({ transactionId });
      if (!alreadyPaid) {
        const metadata = session.metadata;
        const type = metadata.type;
        const userId = metadata.userId;
        const userEmail = metadata.userEmail;
        const recipeId = metadata.recipeId || null;
        const amount = Number(metadata.amount || 0);

        await Payment.create({
          userEmail,
          userId,
          amount,
          recipeId: recipeId ? recipeId : null,
          transactionId,
          paymentStatus: "paid",
          paidAt: new Date(),
        });

        if (type === "premium") {
          await User.findByIdAndUpdate(userId, { isPremium: true });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe Webhook Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
