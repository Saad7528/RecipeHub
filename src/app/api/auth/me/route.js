import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ user: null });
    }

    await dbConnect();
    const user = await User.findById(payload.userId);
    if (!user) {
      const response = NextResponse.json({ user: null });
      response.cookies.set({
        name: "token",
        value: "",
        httpOnly: true,
        expires: new Date(0),
        path: "/",
      });
      return response;
    }

    if (user.isBlocked) {
      const response = NextResponse.json(
        { error: "Account is blocked" },
        { status: 403 }
      );
      response.cookies.set({
        name: "token",
        value: "",
        httpOnly: true,
        expires: new Date(0),
        path: "/",
      });
      return response;
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        isPremium: user.isPremium,
      },
    });
  } catch (error) {
    console.error("Auth Me Error:", error);
    return NextResponse.json({ user: null });
  }
}
