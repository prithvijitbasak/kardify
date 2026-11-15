import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: (process.env.GOOGLE_APP_PASSWORD || "").replace(/\s+/g, ""),
  },
});

export async function sendOtpEmail(toEmail: string, otp: string) {
  await transporter.sendMail({
    from: `"Kardify" <${process.env.EMAIL_USER || "prithvijitbasak22695@gmail.com"}>`,
    to: toEmail,
    subject: "Your Kardify Login OTP",
    text: `Your OTP for Kardify login is: ${otp}. It will expire in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e293b; margin-bottom: 8px;">Kardify Verification Code</h2>
        <p style="color: #475569; font-size: 14px;">Use the OTP below to complete your login. It is valid for 5 minutes.</p>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-radius: 6px; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #2563eb;">${otp}</span>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">If you did not request this OTP, you can safely ignore this email.</p>
      </div>
    `,
  });
}
