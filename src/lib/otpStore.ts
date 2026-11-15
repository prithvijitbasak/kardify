import { getDatabase } from "./mongodb";

const memoryStore = new Map<string, { otp: string; expires_at: number }>();

export async function saveOtp(email: string, otp: string) {
  const expiresAt = Date.now() + 5 * 60 * 1000;
  memoryStore.set(email.toLowerCase(), { otp, expires_at: expiresAt });

  try {
    const db = await getDatabase();
    await db.collection("otps").updateOne(
      { email: email.toLowerCase() },
      {
        $set: {
          otp,
          expires_at: expiresAt.toString(),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("MongoDB OTP save error:", error);
  }
}

export async function verifyAndRemoveOtp(email: string, inputOtp: string) {
  const normalizedEmail = email.toLowerCase();
  const now = Date.now();

  try {
    const db = await getDatabase();
    const doc = await db.collection("otps").findOne({ email: normalizedEmail });
    if (doc) {
      const expiresAt = Number(doc.expires_at);
      if (doc.otp === inputOtp && expiresAt > now) {
        await db.collection("otps").deleteOne({ email: normalizedEmail });
        memoryStore.delete(normalizedEmail);
        return true;
      }
    }
  } catch (error) {
    console.error("MongoDB OTP verify error:", error);
  }

  const memoryRecord = memoryStore.get(normalizedEmail);
  if (memoryRecord && memoryRecord.otp === inputOtp && memoryRecord.expires_at > now) {
    memoryStore.delete(normalizedEmail);
    return true;
  }

  return false;
}
