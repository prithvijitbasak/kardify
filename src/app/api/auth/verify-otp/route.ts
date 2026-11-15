import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getDatabase } from "@/lib/mongodb";
import { verifyAndRemoveOtp } from "@/lib/otpStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const otp = body.otp?.trim();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const isValid = await verifyAndRemoveOtp(email, otp);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    const nowEpoch = Date.now().toString();
    const db = await getDatabase();
    const usersCollection = db.collection("users");
    const existingUser = await usersCollection.findOne({ email });

    if (!existingUser) {
      await usersCollection.insertOne({
        email: email,
        created_at: nowEpoch,
        updated_at: nowEpoch,
      });
    } else {
      await usersCollection.updateOne(
        { email: email },
        { $set: { updated_at: nowEpoch } }
      );
    }

    const secret = process.env.JWT_SECRET as string;
    const token = jwt.sign({ email }, secret, { expiresIn: "30d" });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: { email },
    });

    response.cookies.set("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("verify-otp error:", error);
    return NextResponse.json(
      { success: false, message: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
