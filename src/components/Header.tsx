import Link from "next/link";

interface HeaderProps {
  userEmail?: string | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  showHomeLink?: boolean;
}

export default function Header({
  userEmail,
  onOpenLogin,
  onLogout,
  showHomeLink,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-black/30 backdrop-blur-sm border-b border-white/10 text-white">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 font-bold text-lg shadow-sm">
            📋
          </div>
          <h1 className="text-xl font-bold tracking-wide">Kardify</h1>
        </Link>

        {showHomeLink && (
          <Link
            href="/"
            className="text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1 rounded-md hover:bg-white/10 transition-colors"
          >
            ← Home
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        {userEmail ? (
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-100 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full border border-white/20 transition-colors shadow-sm"
              title="Click to go to Dashboard"
            >
              <span>👤</span>
              <span className="underline decoration-dotted">{userEmail}</span>
            </Link>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-colors"
            >
              Log out
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
          >
            Log in
          </button>
        )}
      </div>
    </header>
  );
}
