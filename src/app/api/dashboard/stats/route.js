import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Recipe from "@/models/Recipe";
import Favorite from "@/models/Favorite";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const totalRecipes = await Recipe.countDocuments({ authorId: payload.userId });
    const totalFavorites = await Favorite.countDocuments({ userId: payload.userId });
    
    const userRecipes = await Recipe.find({ authorId: payload.userId }).select("likesCount");
    const likesReceived = userRecipes.reduce((sum, recipe) => sum + (recipe.likesCount || 0), 0);

    const user = await User.findById(payload.userId).select("isPremium");

    return NextResponse.json({
      totalRecipes,
      totalFavorites,
      likesReceived,
      isPremium: user?.isPremium || false,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
