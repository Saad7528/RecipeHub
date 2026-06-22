import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Recipe from "@/models/Recipe";
import Report from "@/models/Report";
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
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();
    const totalPremiumMembers = await User.countDocuments({ isPremium: true });
    const totalReports = await Report.countDocuments({ status: "pending" });

    return NextResponse.json({
      totalUsers,
      totalRecipes,
      totalPremiumMembers,
      totalReports,
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
