import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = req.headers.get("Authorization")?.replace("Bearer ", "") || body.token;
    if (token !== process.env.DB_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { sql, params = [] } = body;
    if (!sql) return NextResponse.json({ error: "Missing sql" }, { status: 400 });

    const env = (getCloudflareContext().env as any);
    const db = env.DB;
    if (db) {
      const stmt = params.length > 0 ? db.prepare(sql).bind(...params) : db.prepare(sql);
      const res = await stmt.all();
      return NextResponse.json({ success: true, result: [{ results: res.results ?? [] }] });
    }
    return NextResponse.json({ error: "DB binding not available" }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sql = searchParams.get("sql");
    const token = searchParams.get("token");
    if (token !== process.env.DB_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!sql) return NextResponse.json({ error: "Missing sql" }, { status: 400 });

    const env = (getCloudflareContext().env as any);
    const db = env.DB;
    if (db) {
      const stmt = db.prepare(sql);
      const res = await stmt.all();
      return NextResponse.json({ success: true, result: [{ results: res.results ?? [] }] });
    }
    return NextResponse.json({ error: "DB binding not available" }, { status: 500 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
