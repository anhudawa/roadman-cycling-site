import { NextResponse } from "next/server";
export function GET() { return NextResponse.json({ error: "Feature removed" }, { status: 410 }); }
export function POST() { return NextResponse.json({ error: "Feature removed" }, { status: 410 }); }
