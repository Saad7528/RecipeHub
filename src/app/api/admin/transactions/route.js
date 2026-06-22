import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";
import { verifyToken } from "@/lib/jwt";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const payments = await Payment.find().sort({ paidAt: -1 }).lean();

    const serializedPayments = payments.map((p) => ({
      ...p,
      _id: p._id.toString(),
      userId: p.userId.toString(),
      recipeId: p.recipeId ? p.recipeId.toString() : null,
      paidAt: p.paidAt ? p.paidAt.toISOString() : null,
    }));

    return NextResponse.json({ payments: serializedPayments });
  } catch (error) {
    console.error("Admin Get Transactions Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
