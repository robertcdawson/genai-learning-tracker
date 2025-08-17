"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(createClient, []);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.session?.user?.id ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => { mounted = false; sub?.subscription.unsubscribe(); };
  }, [supabase]);

  if (loading) return <div className="card">Loading…</div>;

  if (!userId) {
    return (
      <div className="card" style={{ maxWidth: 520 }}>
        <h3 style={{ marginTop: 0 }}>Sign in to sync</h3>
        <p className="muted" style={{ marginTop: -4 }}>Your data is stored securely per user with RLS.</p>
        <form
          className="hstack"
          onSubmit={async (e) => {
            e.preventDefault();
            await supabase.auth.signInWithOtp({ email });
            alert("Check your email for a sign-in link.");
          }}
        >
          <input
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label="Email"
            type="email"
          />
          <button type="submit" className="btn btn-primary">Send magic link</button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}