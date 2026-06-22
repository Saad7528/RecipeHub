import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Recipe from "@/models/Recipe";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const categoryParam = searchParams.get("category") || "";
    const cuisine = searchParams.get("cuisine") || "";
    const difficulty = searchParams.get("difficulty") || "";
    
    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "8", 10);
    const skip = (page - 1) * limit;

    // Build DB Query
    const query = { status: "published" };

    if (search) {
      query.$or = [
        { recipeName: { $regex: search, $options: "i" } },
        { cuisineType: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (categoryParam) {
      // Split by comma to support multiple categories, satisfying "Use MongoDB $in"
      const categories = categoryParam.split(",").map((c) => c.trim()).filter(Boolean);
      if (categories.length > 0) {
        query.category = { $in: categories };
      }
    }

    if (cuisine) {
      query.cuisineType = { $regex: `^${cuisine}$`, $options: "i" };
    }

    if (difficulty) {
      query.difficultyLevel = difficulty;
    }

    const total = await Recipe.countDocuments(query);
    const recipes = await Recipe.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Map _id to string
    const serializedRecipes = recipes.map((recipe) => ({
      ...recipe,
      _id: recipe._id.toString(),
      authorId: recipe.authorId.toString(),
    }));

    return NextResponse.json({
      recipes: serializedRecipes,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get Recipes Error:", error);
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

    await dbConnect();
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.isBlocked) {
      return NextResponse.json({ error: "Your account is blocked" }, { status: 403 });
    }

    const {
      recipeName,
      recipeImage,
      category,
      cuisineType,
      difficultyLevel,
      preparationTime,
      ingredients,
      instructions,
      price,
    } = await req.json();

    if (
      !recipeName ||
      !recipeImage ||
      !category ||
      !cuisineType ||
      !difficultyLevel ||
      !preparationTime ||
      !ingredients ||
      !instructions
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Limit check for normal users: max 2 recipes
    if (!user.isPremium) {
      const recipeCount = await Recipe.countDocuments({ authorId: user._id });
      if (recipeCount >= 2) {
        return NextResponse.json(
          {
            error: "Normal users can publish a maximum of 2 recipes. Upgrade to Premium to publish unlimited recipes!",
            limitReached: true,
          },
          { status: 400 }
        );
      }
    }

    const newRecipe = await Recipe.create({
      recipeName,
      recipeImage,
      category,
      cuisineType,
      difficultyLevel,
      preparationTime: Number(preparationTime),
      ingredients: Array.isArray(ingredients) ? ingredients : ingredients.split(",").map((i) => i.trim()),
      instructions,
      price: price ? Number(price) : 0,
      authorId: user._id,
      authorName: user.name,
      authorEmail: user.email,
      likesCount: 0,
      isFeatured: false,
      status: "published",
    });

    return NextResponse.json(
      { message: "Recipe created successfully", recipeId: newRecipe._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Recipe Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
