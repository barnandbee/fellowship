"use client";

import { useState, useEffect, useCallback } from "react";

interface Participant {
  id: number;
  email: string;
  created_at: string;
}

interface Assignment {
  email: string;
  team: string;
}

interface AdminData {
  participants: Participant[];
  assignments: Assignment[];
  assigned: boolean;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState("");

  const fetchData = useCallback(async (pw: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/entries", {
        headers: { "x-admin-token": pw },
      });
      if (res.status === 401) {
        setAuthError("Incorrect password.");
        setAuthed(false);
        return;
      }
      const json = await res.json();
      setData(json);
      setAuthed(true);
      setAuthError("");
    } finally {
      setLoading(false);
    }
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    fetchData(password);
  }

  async function handleAssign() {
    setMessage("");
    setAssigning(true);
    try {
      const res = await fetch("/api/admin/assign", {
        method: "POST",
        headers: { "x-admin-token": password },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setMessage(
        `Teams assigned! ${json.teamsPerPerson} teams per person. ${json.remainder} team(s) left unallocated.`
      );
      await fetchData(password);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error assigning teams");
    } finally {
      setAssigning(false);
    }
  }

  useEffect(() => {
    if (authed) fetchData(password);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authed) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🔐</div>
            <h1 className="text-2xl font-black text-gray-800">Admin</h1>
            <p className="text-gray-500 text-sm mt-1">World Cup 2026 Sweepstakes</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-400"
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              {loading ? "Checking…" : "Sign in"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const groupedByEmail = data
    ? data.assignments.reduce<Record<string, string[]>>((acc, { email, team }) => {
        if (!acc[email]) acc[email] = [];
        acc[email].push(team);
        return acc;
      }, {})
    : {};

  return (
    <main className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1">World Cup 2026 Sweepstakes</p>
          </div>
          <button
            onClick={() => fetchData(password)}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 rounded-2xl p-5">
            <div className="text-3xl font-black text-white">{data?.participants.length ?? 0}</div>
            <div className="text-gray-400 text-sm mt-1">Participants</div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-5">
            <div className="text-3xl font-black text-white">{data?.assignments.length ?? 0}</div>
            <div className="text-gray-400 text-sm mt-1">Teams assigned</div>
          </div>
        </div>

        {/* Assign button */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-2">
            {data?.assigned ? "Re-draw teams" : "Draw teams"}
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            {data?.assigned
              ? "This will reset all assignments and randomly re-draw. Any previously communicated results will be invalidated."
              : "Randomly shuffle and distribute teams evenly across all participants. Any remainder will be left unallocated."}
          </p>
          <button
            onClick={handleAssign}
            disabled={assigning || (data?.participants.length ?? 0) === 0}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            {assigning ? "Drawing…" : data?.assigned ? "Re-draw" : "Draw teams now"}
          </button>
          {message && (
            <p className="mt-3 text-sm text-emerald-400">{message}</p>
          )}
        </div>

        {/* Participants */}
        <div className="bg-gray-800 rounded-2xl p-6 mb-6">
          <h2 className="text-white font-bold text-lg mb-4">Participants</h2>
          {(data?.participants.length ?? 0) === 0 ? (
            <p className="text-gray-500 text-sm">No participants yet.</p>
          ) : (
            <div className="space-y-2">
              {data!.participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-gray-700 rounded-xl px-4 py-3"
                >
                  <span className="text-white text-sm font-medium">{p.email}</span>
                  <span className="text-gray-400 text-xs">
                    {new Date(p.created_at + "Z").toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assignments */}
        {data?.assigned && (
          <div className="bg-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-4">Assignments</h2>
            <div className="space-y-4">
              {data.participants.map((p) => (
                <div key={p.email}>
                  <div className="text-emerald-400 text-sm font-semibold mb-2">{p.email}</div>
                  <div className="flex flex-wrap gap-2">
                    {(groupedByEmail[p.email] ?? []).map((team) => (
                      <span
                        key={team}
                        className="bg-gray-700 text-white text-xs px-3 py-1 rounded-full"
                      >
                        {team}
                      </span>
                    ))}
                    {!groupedByEmail[p.email] && (
                      <span className="text-gray-500 text-xs">No teams</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
