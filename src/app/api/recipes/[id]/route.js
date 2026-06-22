import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Recipe from "@/models/Recipe";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Check auth cookie to see if user is logged in
    const token = req.cookies.get("token")?.value;
    let userId = null;
    let userRole = null;
    let userEmail = null;

    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        userId = payload.userId;
        userRole = payload.role;
        userEmail = payload.email;
      }
    }

    const isAuthor = userId && recipe.authorId.toString() === userId;
    const isAdmin = userRole === "admin";

    // Handle locked/paid recipe validation
    if (recipe.price > 0) {
      let isUnlocked = false;

      if (isAuthor || isAdmin) {
        isUnlocked = true;
      } else if (userId) {
        // Query payments database for this recipe purchase
        const purchase = await Payment.findOne({
          userId,
          recipeId: recipe._id,
          paymentStatus: "paid",
        });
        if (purchase) {
          isUnlocked = true;
        }
      }

      if (!isUnlocked) {
        // Hide ingredients and instructions for locked recipes
        const lockedRecipe = recipe.toObject();
        delete lockedRecipe.ingredients;
        delete lockedRecipe.instructions;

        return NextResponse.json({
          recipe: {
            ...lockedRecipe,
            _id: recipe._id.toString(),
            authorId: recipe.authorId.toString(),
          },
          isLocked: true,
        });
      }
    }

    // Free recipe or unlocked paid recipe
    return NextResponse.json({
      recipe: {
        ...recipe.toObject(),
        _id: recipe._id.toString(),
        authorId: recipe.authorId.toString(),
      },
      isLocked: false,
    });
  } catch (error) {
    console.error("Get Recipe Detail Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const isAuthor = recipe.authorId.toString() === payload.userId;
    const isAdmin = payload.role === "admin";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const allowedUpdates = [
      "recipeName",
      "recipeImage",
      "category",
      "cuisineType",
      "difficultyLevel",
      "preparationTime",
      "ingredients",
      "instructions",
      "price",
    ];

    allowedUpdates.forEach((field) => {
      if (body[field] !== undefined) {
        if (field === "ingredients" && !Array.isArray(body[field])) {
          recipe[field] = body[field].split(",").map((i) => i.trim());
        } else {
          recipe[field] = body[field];
        }
      }
    });

    await recipe.save();

    return NextResponse.json({
      message: "Recipe updated successfully",
      recipe: {
        ...recipe.toObject(),
        _id: recipe._id.toString(),
        authorId: recipe.authorId.toString(),
      },
    });
  } catch (error) {
    console.error("Update Recipe Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const isAuthor = recipe.authorId.toString() === payload.userId;
    const isAdmin = payload.role === "admin";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Recipe.findByIdAndDelete(id);

    return NextResponse.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Delete Recipe Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
