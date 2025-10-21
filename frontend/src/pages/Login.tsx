import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Toaster } from "../components/ui/sonner";
import vosLogo from "/vos-logo.png";
import { setToken } from "../lib/api";

interface LoginProps {
  onLogin?: (email: string, password: string) => void; // optioneel: externe handler
  onNavigate?: (page: string) => void;                 // jouw useState-router
}

export function Login({ onLogin, onNavigate }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Optioneel externe callback laten meelopen
      if (onLogin) onLogin(email, password);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Login failed (${res.status})`);
      }

      const data = await res.json();
      // Verwacht { token: "..." } vanuit backend
      if (!data?.token) {
        throw new Error("Geen token ontvangen van de server.");
      }

      setToken(data.token);

      // Navigeer na succes (pas aan naar jouw pagina-key)
      onNavigate?.("customers");
    } catch (err: any) {
      setError(err?.message || "Login mislukt");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Toaster />
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--background)" }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <img
                src={vosLogo}
                alt="Van Soest Office Support"
                className="h-24 w-auto"
              />
            </div>
            <p style={{ color: "var(--text-secondary)" }}>Welkom terug</p>
          </div>

          <div
            className="p-8 rounded-xl shadow-md"
            style={{ backgroundColor: "var(--panel)" }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">E-mailadres</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="naam@bedrijf.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Wachtwoord</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between mb-1">
                <label
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <input type="checkbox" className="rounded" />
                  Onthoud mij
                </label>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate("forgot-password")}
                    className="text-sm hover:underline"
                    style={{ color: "var(--accent)" }}
                  >
                    Wachtwoord vergeten?
                  </button>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-600 -mt-2">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl hover:scale-105 transition-transform"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "#FFFFFF",
                }}
              >
                {loading ? "Inloggen…" : "Inloggen"}
              </Button>
            </form>

            <p
              className="text-sm text-center mt-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Nog geen account? Neem contact op met je beheerder.
            </p>
          </div>

          {/* Demo accounts (statisch) */}
          <div
            className="mt-6 p-4 rounded-xl"
            style={{
              backgroundColor: "var(--panel)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
              <strong>Demo accounts:</strong>
            </p>
            <div
              className="space-y-2 text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              <div>
                <strong>Beheerder:</strong> anita@vansoest.nl
              </div>
              <div>
                <strong>Medewerker:</strong> thomas@vansoest.nl
              </div>
              <div>
                <strong>Klant:</strong> sophie@devries.nl
              </div>
              <div
                className="mt-2 pt-2"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <em>Gebruik een willekeurig wachtwoord en een 6-cijferige code voor 2FA</em>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
