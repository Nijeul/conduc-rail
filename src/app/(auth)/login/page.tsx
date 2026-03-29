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
    <div className="min-h-screen flex items-center justify-center bg-surface-light">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Conduc Rail</h1>
            <p className="text-blue-200 text-sm mt-1">
              Gestion de chantiers ferroviaires
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
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
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                           placeholder:text-text-secondary/50"
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
                           focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                           placeholder:text-text-secondary/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-action text-white py-2.5 rounded-md text-sm font-medium
                         hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
