"use client";

import { useState } from "react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (email?: string) => void;
}

export default function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  if (!open) return null;

  function handleClose() {
    setStep("email");
    setEmail("");
    setOtp("");
    setMessage(null);
    setLoading(false);
    onClose();
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage({ type: "error", text: data.message || "Failed to send OTP." });
        setLoading(false);
        return;
      }

      setStep("otp");
      setMessage({ type: "success", text: "OTP sent! Check your inbox." });
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const trimmedOtp = otp.trim();
    if (!trimmedOtp || trimmedOtp.length < 6) {
      setMessage({ type: "error", text: "Please enter a valid 6-digit OTP." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: trimmedOtp }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage({ type: "error", text: data.message || "Invalid or expired OTP." });
        setLoading(false);
        return;
      }

      if (onSuccess) {
        onSuccess(email.trim().toLowerCase());
      }
      handleClose();
    } catch {
      setMessage({ type: "error", text: "Verification failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h2 className="text-lg font-bold text-slate-800">
              {step === "email" ? "Log in to Kardify" : "Enter Verification Code"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg text-xs font-medium ${
                message.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your email address to receive a one-time verification code (OTP). No password needed.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  autoFocus
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                We sent a 6-digit code to <span className="font-semibold text-slate-700">{email}</span>.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">6-Digit Code</label>
                <input
                  type="text"
                  autoFocus
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-mono px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                {loading ? "Verifying..." : "Verify & Log in"}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSendOtp}
                  className="hover:text-blue-600 underline font-medium"
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setMessage(null);
                  }}
                  className="hover:text-slate-800"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
