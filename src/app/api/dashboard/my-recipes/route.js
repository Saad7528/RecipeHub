import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
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
    const recipes = await Recipe.find({ authorId: payload.userId }).sort({ createdAt: -1 }).lean();

    const serializedRecipes = recipes.map((recipe) => ({
      ...recipe,
      _id: recipe._id.toString(),
      authorId: recipe.authorId.toString(),
    }));

    return NextResponse.json({ recipes: serializedRecipes });
  } catch (error) {
    console.error("Get My Recipes Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
