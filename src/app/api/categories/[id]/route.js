import { NextResponse } from "next/server";
import { getDb, mapCategory } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { validateCategory } from "@/lib/validation";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!id || id.length > 80) return NextResponse.json({ error: "Noto‘g‘ri ID" }, { status: 400 });

  let category;
  try {
    category = validateCategory(await request.json());
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data, error } = await getDb()
    .from("categories")
    .update({ ...category, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Kategoriya saqlanmadi" }, { status: 500 });
  }
  return data ? NextResponse.json(mapCategory(data)) : NextResponse.json({ error: "Topilmadi" }, { status: 404 });
}

export async function DELETE(_request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!id || id.length > 80) return NextResponse.json({ error: "Noto‘g‘ri ID" }, { status: 400 });

  const database = getDb();
  const { count, error: countError } = await database
    .from("dishes")
    .select("id", { count: "exact", head: true })
    .eq("category", id);

  if (countError) {
    console.error(countError);
    return NextResponse.json({ error: "Kategoriya tekshirilmadi" }, { status: 500 });
  }
  if (count) {
    return NextResponse.json(
      { error: `Bu kategoriyada ${count} ta taom bor. Avval taomlarni boshqa kategoriyaga o‘tkazing.` },
      { status: 409 },
    );
  }

  const { data, error } = await database.from("categories").delete().eq("id", id).select("id").maybeSingle();
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Kategoriya o‘chirilmadi" }, { status: 500 });
  }
  return data ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Topilmadi" }, { status: 404 });
}
