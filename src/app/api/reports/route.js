import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Report from "@/models/Report";
import Recipe from "@/models/Recipe";
import { verifyToken } from "@/lib/jwt";

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

    const { recipeId, reason } = await req.json();
    if (!recipeId || !reason) {
      return NextResponse.json({ error: "Recipe ID and reason are required" }, { status: 400 });
    }

    if (!["Spam", "Offensive Content", "Copyright Issue"].includes(reason)) {
      return NextResponse.json({ error: "Invalid report reason" }, { status: 400 });
    }

    await dbConnect();
    
    // Check if recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    const report = await Report.create({
      recipeId,
      reporterEmail: payload.email,
      reason,
      status: "pending",
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "Recipe reported successfully", reportId: report._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Report Recipe Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    // Fetch reports
    const reports = await Report.find().sort({ createdAt: -1 }).lean();

    const populatedReports = [];
    for (let r of reports) {
      const recipe = await Recipe.findById(r.recipeId).select("recipeName recipeImage authorEmail").lean();
      populatedReports.push({
        ...r,
        _id: r._id.toString(),
        recipeId: r.recipeId.toString(),
        recipeName: recipe?.recipeName || "Unknown/Deleted Recipe",
        recipeImage: recipe?.recipeImage || "",
        recipeAuthorEmail: recipe?.authorEmail || "N/A",
      });
    }

    return NextResponse.json({ reports: populatedReports });
  } catch (error) {
    console.error("Get Reports Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
