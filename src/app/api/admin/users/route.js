import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
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
    const users = await User.find().sort({ createdAt: -1 }).select("-password").lean();
    
    const serializedUsers = users.map((u) => ({
      ...u,
      _id: u._id.toString(),
    }));

    return NextResponse.json({ users: serializedUsers });
  } catch (error) {
    console.error("Admin Get Users Error:", error);
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

    const { targetUserId, action } = await req.json();
    if (!targetUserId || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(targetUserId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Protect blocking self
    if (user._id.toString() === payload.userId) {
      return NextResponse.json({ error: "You cannot block yourself" }, { status: 400 });
    }

    if (action === "block") {
      user.isBlocked = true;
    } else if (action === "unblock") {
      user.isBlocked = false;
    } else if (action === "promote") {
      user.role = "admin";
    } else if (action === "demote") {
      user.role = "user";
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await user.save();
    return NextResponse.json({ message: "User state updated successfully" });
  } catch (error) {
    console.error("Admin Update User Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
