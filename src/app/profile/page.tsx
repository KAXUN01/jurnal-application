"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, User, Mail, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-surface-600 border-t-neon-green" />
      </div>
    );
  }

  if (!session?.user) {
    return null; // Redirecting...
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">User Profile</h1>
        <p className="text-gray-400">Manage your account settings and preferences.</p>
      </div>

      <div className="bg-surface-800/50 border border-surface-600/50 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-8 border-b border-surface-600/50 flex items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-neon-green/20 to-neon-blue/20 border-2 border-neon-green/30 flex items-center justify-center shadow-glow-blue">
            <span className="text-3xl font-bold text-white uppercase">
              {session.user.name?.[0] || session.user.email?.[0] || "U"}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{session.user.name || "Administrator"}</h2>
            <p className="text-neon-green font-medium">{session.user.role === 'admin' ? 'Super Admin' : 'User'}</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-900/50 rounded-xl p-5 border border-surface-600/50">
              <div className="flex items-center gap-3 text-gray-400 mb-2">
                <Mail className="h-5 w-5" />
                <span className="text-sm font-medium">Email Address</span>
              </div>
              <p className="text-lg text-white">{session.user.email}</p>
            </div>

            <div className="bg-surface-900/50 rounded-xl p-5 border border-surface-600/50">
              <div className="flex items-center gap-3 text-gray-400 mb-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">Account Role</span>
              </div>
              <p className="text-lg text-white capitalize">{session.user.role}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-surface-600/50">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 rounded-xl bg-red-500/10 text-red-500 px-5 py-3 text-sm font-bold transition-all hover:bg-red-500/20 border border-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
