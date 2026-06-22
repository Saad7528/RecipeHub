import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Recipe from "@/models/Recipe";
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
    const recipes = await Recipe.find().sort({ createdAt: -1 }).lean();

    const serializedRecipes = recipes.map((r) => ({
      ...r,
      _id: r._id.toString(),
      authorId: r.authorId.toString(),
    }));

    return NextResponse.json({ recipes: serializedRecipes });
  } catch (error) {
    console.error("Admin Get Recipes Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { recipeId, isFeatured } = await req.json();
    if (!recipeId) {
      return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 });
    }

    await dbConnect();
    const recipe = await Recipe.findByIdAndUpdate(
      recipeId,
      { isFeatured },
      { new: true }
    );

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: `Recipe featured status updated to ${isFeatured}`,
      recipe: {
        ...recipe.toObject(),
        _id: recipe._id.toString(),
        authorId: recipe.authorId.toString(),
      },
    });
  } catch (error) {
    console.error("Admin Update Recipe Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
