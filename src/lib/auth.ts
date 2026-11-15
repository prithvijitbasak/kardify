import { cookies, headers } from "next/headers";
import jwt from "jsonwebtoken";

export async function getAuthUser() {
  const cookieStore = await cookies();
  const headersList = await headers();

  const token =
    cookieStore.get("accessToken")?.value ||
    headersList.get("accessToken");

  if (!token) {
    return null;
  }

  try {
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as unknown as { email: string };
    return { email: decoded.email };
  } catch {
    return null;
  }
}
