import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Favorite from "@/models/Favorite";
import Recipe from "@/models/Recipe";
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
    const favorites = await Favorite.find({ userId: payload.userId }).lean();
    const recipeIds = favorites.map((f) => f.recipeId);

    const recipes = await Recipe.find({ _id: { $in: recipeIds }, status: "published" }).lean();
    
    const serializedRecipes = recipes.map((recipe) => ({
      ...recipe,
      _id: recipe._id.toString(),
      authorId: recipe.authorId.toString(),
    }));

    return NextResponse.json({ recipes: serializedRecipes });
  } catch (error) {
    console.error("Get Favorites Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
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

    const { recipeId } = await req.json();
    if (!recipeId) {
      return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 });
    }

    await dbConnect();
    const existingFav = await Favorite.findOne({
      userId: payload.userId,
      recipeId,
    });

    if (existingFav) {
      return NextResponse.json({ message: "Already in favorites" });
    }

    await Favorite.create({
      userEmail: payload.email,
      userId: payload.userId,
      recipeId,
      addedAt: new Date(),
    });

    return NextResponse.json({ message: "Added to favorites" }, { status: 201 });
  } catch (error) {
    console.error("Add Favorite Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
