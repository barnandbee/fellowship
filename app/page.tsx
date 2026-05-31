"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [teams, setTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSubmitted(true);
      setAlreadyExists(data.alreadyExists);
      setTeams(data.teams);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">⚽</div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            World Cup 2026
          </h1>
          <p className="text-emerald-300 text-lg mt-1 font-medium">Sweepstakes</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {!submitted ? (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Enter the draw</h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter your email to join. Once everyone is in, teams will be randomly
                assigned — come back here to see yours.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-400"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
                >
                  {loading ? "Entering…" : "Join Sweepstakes"}
                </button>
              </form>
            </>
          ) : (
            <SuccessView
              email={email}
              alreadyExists={alreadyExists}
              teams={teams}
              onReset={() => {
                setSubmitted(false);
                setEmail("");
                setTeams([]);
                setAlreadyExists(false);
              }}
            />
          )}
        </div>

        <p className="text-center text-emerald-400 text-xs mt-6">
          Already entered? Re-submit your email to check your teams.
        </p>
      </div>
    </main>
  );
}

function SuccessView({
  email,
  alreadyExists,
  teams,
  onReset,
}: {
  email: string;
  alreadyExists: boolean;
  teams: string[];
  onReset: () => void;
}) {
  return (
    <div className="text-center">
      {teams.length > 0 ? (
        <>
          <div className="text-4xl mb-3">🏆</div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Your teams are in!</h2>
          <p className="text-gray-500 text-sm mb-5">
            Good luck, <span className="font-medium text-gray-700">{email}</span>!
          </p>
          <div className="text-left space-y-2 mb-6">
            {teams.map((team) => (
              <div
                key={team}
                className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3"
              >
                <span className="text-xl">⚽</span>
                <span className="font-semibold text-gray-800">{team}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="text-4xl mb-3">{alreadyExists ? "👋" : "🎉"}</div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            {alreadyExists ? "You're already in!" : "You're in the draw!"}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Teams haven&apos;t been assigned yet. Check back here once the organiser has
            done the draw — just re-enter your email to see your teams.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm">
            <strong>Registered:</strong> {email}
          </div>
        </>
      )}
      <button
        onClick={onReset}
        className="mt-5 text-sm text-green-600 hover:underline"
      >
        ← Back
      </button>
    </div>
  );
}
