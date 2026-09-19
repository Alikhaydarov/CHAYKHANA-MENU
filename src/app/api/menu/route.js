import { NextResponse } from "next/server";
import { listPublicMenu } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const menu = await listPublicMenu();
    return NextResponse.json(menu, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Menu yuklanmadi" }, { status: 503 });
  }
}
