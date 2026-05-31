import { NextRequest, NextResponse } from "next/server";
import { getAllParticipants, saveAssignments } from "@/lib/db";
import { TEAMS } from "@/lib/teams";

function isAdmin(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  return token === process.env.ADMIN_PASSWORD;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const participants = getAllParticipants();
  if (participants.length === 0) {
    return NextResponse.json({ error: "No participants to assign" }, { status: 400 });
  }

  const shuffledTeams = shuffle(TEAMS);
  const n = participants.length;
  const teamsPerPerson = Math.floor(shuffledTeams.length / n);
  const allocated = shuffledTeams.slice(0, teamsPerPerson * n);

  const assignments: { email: string; team: string }[] = [];
  for (let i = 0; i < n; i++) {
    const slice = allocated.slice(i * teamsPerPerson, (i + 1) * teamsPerPerson);
    for (const team of slice) {
      assignments.push({ email: participants[i].email, team });
    }
  }

  saveAssignments(assignments);
  return NextResponse.json({ success: true, teamsPerPerson, remainder: shuffledTeams.length - allocated.length });
}
