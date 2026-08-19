const LANGS = ["uz", "ko", "ru", "en"];
const MAX_IMAGE_URL_LENGTH = 2048;

function localized(value, field, maxLength, requiredUz = false) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${field} noto‘g‘ri`);
  const result = {};
  for (const lang of LANGS) {
    const text = typeof value[lang] === "string" ? value[lang].trim() : "";
    if (text.length > maxLength) throw new Error(`${field} juda uzun`);
    result[lang] = text;
  }
  if (requiredUz && !result.uz) throw new Error(`${field} (UZ) kiritilishi shart`);
  return result;
}

function validImageSource(image) {
  if (image.startsWith("/assets/") && !image.includes("..")) return true;
  try {
    const url = new URL(image);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".supabase.co") &&
      url.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

export function categoryIdFromName(name) {
  const id = String(name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ʻʼ‘’'`]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return id || `category-${Date.now()}`;
}

export function validateCategory(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Noto‘g‘ri ma’lumot");
  const position = Number(input.position ?? 0);
  if (!Number.isSafeInteger(position) || position < 0 || position > 100_000) {
    throw new Error("Tartib raqami noto‘g‘ri");
  }
  return {
    names: localized(input.names, "Kategoriya nomi", 80, true),
    visible: input.visible !== false,
    position,
  };
}

export function validateDish(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Noto‘g‘ri ma’lumot");
  const category = String(input.category ?? "").trim();
  const price = Number(input.price);
  const position = Number(input.position ?? 0);
  const image = String(input.image ?? "").trim();

  if (!category || category.length > 80) throw new Error("Kategoriya noto‘g‘ri");
  if (!Number.isSafeInteger(price) || price < 0 || price > 10_000_000) throw new Error("Narx noto‘g‘ri");
  if (!Number.isSafeInteger(position) || position < 0 || position > 100_000) throw new Error("Tartib raqami noto‘g‘ri");
  if (!image || image.length > MAX_IMAGE_URL_LENGTH || !validImageSource(image)) {
    throw new Error("Rasm manzili noto‘g‘ri");
  }

  return {
    category,
    price,
    image,
    visible: input.visible !== false,
    position,
    names: localized(input.names, "Nom", 100, true),
    descriptions: localized(input.descriptions, "Tavsif", 500),
  };
}

export function jsonError(message, status = 400) {
  return Response.json({ error: message }, { status });
}
