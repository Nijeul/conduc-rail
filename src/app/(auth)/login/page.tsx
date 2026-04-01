"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else {
        router.push("/projets");
        router.refresh();
      }
    } catch {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
         style={{ backgroundColor: '#004489' }}>
      {/* Title above card */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">CONDUC RAIL</h1>
        <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.70)' }}>
          Gestion de chantiers ferroviaires
        </p>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ borderRadius: '8px' }}>
          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-danger rounded-md px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-main"
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@conducrail.fr"
                required
                className="w-full px-3 py-2 border border-border rounded-md text-sm
                           focus:outline-none focus:ring-2 focus:border-[#004489]
                           placeholder:text-text-secondary/50"
                style={{ '--tw-ring-color': 'rgba(0,68,137,0.3)' } as React.CSSProperties}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-main"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="demo1234"
                required
                className="w-full px-3 py-2 border border-border rounded-md text-sm
                           focus:outline-none focus:ring-2 focus:border-[#004489]
                           placeholder:text-text-secondary/50"
                style={{ '--tw-ring-color': 'rgba(0,68,137,0.3)' } as React.CSSProperties}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-2.5 rounded-md text-sm font-medium
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#004489' }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.backgroundColor = '#003370'); }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.backgroundColor = '#004489'); }}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            <p className="text-xs text-text-secondary text-center mt-4">
              Demo : admin@conducrail.fr / demo1234
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
