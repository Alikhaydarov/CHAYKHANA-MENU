import { NextResponse } from "next/server";
import { categoryExists, getDb, mapDish, removeDishImage } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { validateDish } from "@/lib/validation";

export const runtime = "nodejs";

export async function PUT(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Noto‘g‘ri ID" }, { status: 400 });

  let dish;
  try {
    dish = validateDish(await request.json());
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

  const database = getDb();
  const { data: current, error: currentError } = await database
    .from("dishes")
    .select("image")
    .eq("id", id)
    .maybeSingle();

  if (currentError) {
    console.error(currentError);
    return NextResponse.json({ error: "Taom tekshirilmadi" }, { status: 500 });
  }
  if (!current) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const { data, error } = await database
    .from("dishes")
    .update({ ...dish, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Saqlashda xato" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  if (current.image && current.image !== data.image) await removeDishImage(current.image);
  return NextResponse.json(mapDish(data));
}

export async function DELETE(_request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Noto‘g‘ri ID" }, { status: 400 });

  const database = getDb();
  const { data: current, error: currentError } = await database
    .from("dishes")
    .select("image")
    .eq("id", id)
    .maybeSingle();

  if (currentError) {
    console.error(currentError);
    return NextResponse.json({ error: "Taom tekshirilmadi" }, { status: 500 });
  }
  if (!current) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const { data, error } = await database.from("dishes").delete().eq("id", id).select("id").maybeSingle();
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "O‘chirishda xato" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  await removeDishImage(current.image);
  return NextResponse.json({ ok: true });
}
