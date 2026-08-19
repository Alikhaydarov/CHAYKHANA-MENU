import { NextResponse } from "next/server";
import { getDb, listCategories, mapCategory } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { categoryIdFromName, validateCategory } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request) {
  const admin = new URL(request.url).searchParams.get("admin") === "1";
  if (admin && !(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await listCategories(admin));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kategoriyalar bazasi tayyor emas" }, { status: 503 });
  }
}

export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let category;
  try {
    category = validateCategory(await request.json());
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const database = getDb();
  const { data: maxRows, error: maxError } = await database
    .from("categories")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    return NextResponse.json({ error: "Kategoriyalar bazasi tayyor emas" }, { status: 503 });
  }

  category.position = (maxRows?.[0]?.position || 0) + 1;

  const baseId = categoryIdFromName(category.names.uz);
  let id = baseId;
  for (let suffix = 2; suffix < 100; suffix += 1) {
    const { data, error } = await database.from("categories").select("id").eq("id", id).maybeSingle();
    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Kategoriya tekshirilmadi" }, { status: 500 });
    }
    if (!data) break;
    id = `${baseId}-${suffix}`;
  }

  const { data, error } = await database.from("categories").insert({ id, ...category }).select().single();
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Kategoriya saqlanmadi" }, { status: 500 });
  }
  return NextResponse.json(mapCategory(data), { status: 201 });
}
