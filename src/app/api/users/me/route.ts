import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as unknown as { email: string };

    return NextResponse.json({
      email: decoded.email,
      username: decoded.email.split("@")[0],
      fullName: decoded.email.split("@")[0],
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid or expired session" },
      { status: 401 }
    );
  }
}
