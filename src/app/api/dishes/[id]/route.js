import { NextResponse } from "next/server";
import { categoryExists, getDb, mapDish } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { validateDish } from "@/lib/validation";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Noto‘g‘ri ID" }, { status: 400 });

  let dish;
  try {
    dish = validateDish(await request.json(), { partial: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  try {
    if (!(await categoryExists(dish.category))) {
      return NextResponse.json({ error: "Tanlangan kategoriya mavjud emas" }, { status: 400 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kategoriyalar bazasi tayyor emas" }, { status: 503 });
  }

  const { data, error } = await getDb()
    .from("dishes")
    .update({ ...dish, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Saqlashda xato" }, { status: 500 });
  }
  return data ? NextResponse.json(mapDish(data)) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(_request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Noto‘g‘ri ID" }, { status: 400 });
  const { data, error } = await getDb().from("dishes").delete().eq("id", id).select("id").maybeSingle();
  if (error) return NextResponse.json({ error: "O‘chirishda xato" }, { status: 500 });
  return data ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Topilmadi" }, { status: 404 });
}
