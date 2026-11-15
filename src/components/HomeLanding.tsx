"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "./Header";
import LoginModal from "./LoginModal";

interface HomeLandingProps {
  initialUserEmail: string | null;
}

export default function HomeLanding({ initialUserEmail }: HomeLandingProps) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(initialUserEmail);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUserEmail(null);
    router.refresh();
  }

  function handleLoginSuccess(email?: string) {
    if (email) setUserEmail(email);
    setIsLoginOpen(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white">
      <Header
        userEmail={userEmail}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wide uppercase text-blue-200 mb-8 backdrop-blur-sm">
          <span>✨</span> Simple & Beginner-Friendly Task Management
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-3xl mb-6">
          Organize anything, together with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Kardify</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-200 max-w-2xl mb-10 leading-relaxed font-normal">
          A modern Trello clone powered by Next.js, Tailwind CSS, and MongoDB. Manage your workflow with visual lists, cards, and passwordless authentication.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          {userEmail ? (
            <Link
              href="/dashboard"
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Go to Dashboard →
            </Link>
          ) : (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-base font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Get Started with Email OTP →
            </button>
          )}

          <a
            href="#features"
            className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-base font-semibold rounded-xl transition-colors backdrop-blur-sm"
          >
            Explore Features
          </a>
        </div>

        <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left mt-6">
          <div className="bg-white/10 border border-white/15 p-6 rounded-2xl backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/30 flex items-center justify-center text-xl mb-4">
              📋
            </div>
            <h3 className="text-lg font-bold mb-2">Visual Kanban Lists</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Create, rename, and delete lists. Drag and drop cards or shift them with quick navigation buttons.
            </p>
          </div>

          <div className="bg-white/10 border border-white/15 p-6 rounded-2xl backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center text-xl mb-4">
              🔑
            </div>
            <h3 className="text-lg font-bold mb-2">Passwordless OTP</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sign in securely using only your email. Receive a 6-digit OTP code directly in your inbox.
            </p>
          </div>

          <div className="bg-white/10 border border-white/15 p-6 rounded-2xl backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-500/30 flex items-center justify-center text-xl mb-4">
              🗄️
            </div>
            <h3 className="text-lg font-bold mb-2">MongoDB Cloud Storage</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Persistent collections for lists and cards, linking each card cleanly to its parent list.
            </p>
          </div>
        </section>
      </main>

      <LoginModal
        open={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
