import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Payment from "@/models/Payment";
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

    const { sessionId, type, recipeId, amount } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    await dbConnect();

    // Check if transaction was already processed
    const existingPayment = await Payment.findOne({ transactionId: sessionId });
    if (existingPayment) {
      return NextResponse.json({
        message: "Payment already processed",
        payment: existingPayment,
      });
    }

    let processedType = type;
    let processedRecipeId = recipeId || null;
    let processedAmount = amount ? Number(amount) : 0;

    // Handle Mock checkout logic
    if (sessionId.startsWith("mock_session_")) {
      const payment = await Payment.create({
        userEmail: payload.email,
        userId: payload.userId,
        amount: processedAmount,
        recipeId: processedRecipeId ? processedRecipeId : null,
        transactionId: sessionId,
        paymentStatus: "paid",
        paidAt: new Date(),
      });

      if (processedType === "premium") {
        await User.findByIdAndUpdate(payload.userId, { isPremium: true });
      }

      return NextResponse.json({
        message: "Payment successfully verified (Mock mode)",
        payment,
      });
    }

    // Real Stripe checkout logic
    if (!stripe) {
      return NextResponse.json({ error: "Stripe configuration error" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session || session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    processedType = session.metadata.type;
    processedRecipeId = session.metadata.recipeId || null;
    processedAmount = Number(session.metadata.amount || 0);

    const payment = await Payment.create({
      userEmail: session.metadata.userEmail,
      userId: session.metadata.userId,
      amount: processedAmount,
      recipeId: processedRecipeId ? processedRecipeId : null,
      transactionId: session.id,
      paymentStatus: "paid",
      paidAt: new Date(),
    });

    if (processedType === "premium") {
      await User.findByIdAndUpdate(session.metadata.userId, { isPremium: true });
    }

    return NextResponse.json({
      message: "Payment successfully verified",
      payment,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
