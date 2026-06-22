import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Favorite from "@/models/Favorite";
import { verifyToken } from "@/lib/jwt";

export async function DELETE(req, { params }) {
  try {
    const { recipeId } = await params;
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    await Favorite.findOneAndDelete({
      userId: payload.userId,
      recipeId,
    });

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Delete Favorite Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
