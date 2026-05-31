import { NextRequest, NextResponse } from "next/server";
import { addParticipant, getAssignmentsForEmail } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const { alreadyExists } = addParticipant(email);
  const teams = getAssignmentsForEmail(email);

  return NextResponse.json({ success: true, alreadyExists, teams });
}
