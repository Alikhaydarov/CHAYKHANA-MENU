import { NextResponse } from "next/server";
import { categoryExists, getDb, listDishes, mapDish } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { validateDish } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET(request) {
  const admin = new URL(request.url).searchParams.get("admin") === "1";
  if (admin && !(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await listDishes(admin));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  const { data: maxRows, error: maxError } = await database
    .from("dishes")
    .select("position")
    .order("position", { ascending: false })
    .limit(1);

  if (maxError) {
    console.error(maxError);
    return NextResponse.json({ error: "Taomlar tartibi aniqlanmadi" }, { status: 500 });
  }

  dish.position = (maxRows?.[0]?.position || 0) + 1;

  // Admin panel first creates a placeholder and opens it in the editor.
  // Keep that placeholder private until the admin explicitly publishes it.
  if (dish.names.uz === "Yangi taom" && dish.price === 0) dish.visible = false;

  const { data, error } = await database.from("dishes").insert(dish).select().single();
  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Saqlashda xato" }, { status: 500 });
  }
  return NextResponse.json(mapDish(data), { status: 201 });
}
