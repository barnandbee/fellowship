import { NextRequest, NextResponse } from "next/server";
import { getAssignmentsForEmail } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ teams: [] });
  const teams = getAssignmentsForEmail(email);
  return NextResponse.json({ teams });
}
