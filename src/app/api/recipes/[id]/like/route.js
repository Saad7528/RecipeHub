import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Recipe from "@/models/Recipe";
import { verifyToken } from "@/lib/jwt";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const recipe = await Recipe.findByIdAndUpdate(
      id,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Recipe liked",
      likesCount: recipe.likesCount,
    });
  } catch (error) {
    console.error("Like Recipe Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
