import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await dbConnect();
    const { name, email, image } = await req.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and Name are required for Google Login" },
        { status: 400 }
      );
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      if (user.isBlocked) {
        return NextResponse.json(
          { error: "Your account is blocked. Please contact admin." },
          { status: 403 }
        );
      }
      if (!user.image && image) {
        user.image = image;
        await user.save();
      }
    } else {
      // Create new user with random password
      const randomPassword = Math.random().toString(36).slice(-10) + "A1a";
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        image: image || "",
        role: "user",
        isBlocked: false,
        isPremium: false,
      });
    }

    // Generate JWT
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Google Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        isPremium: user.isPremium,
      },
    });

    // Set cookie
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
