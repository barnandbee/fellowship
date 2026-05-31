import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "sweepstakes.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.exec(`
      CREATE TABLE IF NOT EXISTS participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        team TEXT NOT NULL,
        UNIQUE(team)
      );
    `);
  }
  return _db;
}

export function addParticipant(email: string): { success: boolean; alreadyExists: boolean } {
  const db = getDb();
  try {
    db.prepare("INSERT INTO participants (email) VALUES (?)").run(email.toLowerCase().trim());
    return { success: true, alreadyExists: false };
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("UNIQUE constraint failed")) {
      return { success: true, alreadyExists: true };
    }
    throw e;
  }
}

export function getAllParticipants(): { id: number; email: string; created_at: string }[] {
  return getDb().prepare("SELECT * FROM participants ORDER BY created_at ASC").all() as {
    id: number;
    email: string;
    created_at: string;
  }[];
}

export function getAssignmentsForEmail(email: string): string[] {
  const rows = getDb()
    .prepare("SELECT team FROM assignments WHERE email = ? ORDER BY team ASC")
    .all(email.toLowerCase().trim()) as { team: string }[];
  return rows.map((r) => r.team);
}

export function getAllAssignments(): { email: string; team: string }[] {
  return getDb()
    .prepare("SELECT email, team FROM assignments ORDER BY email ASC, team ASC")
    .all() as { email: string; team: string }[];
}

export function hasAssignments(): boolean {
  const row = getDb().prepare("SELECT COUNT(*) as count FROM assignments").get() as {
    count: number;
  };
  return row.count > 0;
}

export function saveAssignments(assignments: { email: string; team: string }[]): void {
  const db = getDb();
  const deleteAll = db.prepare("DELETE FROM assignments");
  const insert = db.prepare("INSERT INTO assignments (email, team) VALUES (?, ?)");
  const doIt = db.transaction(() => {
    deleteAll.run();
    for (const { email, team } of assignments) {
      insert.run(email, team);
    }
  });
  doIt();
}
