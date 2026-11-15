import { NextResponse } from "next/server";
import { saveOtp } from "@/lib/otpStore";
import { sendOtpEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await saveOtp(email, otp);
    await sendOtpEmail(email, otp);

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("send-otp error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
