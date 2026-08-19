const LANGS = ["uz", "ko", "ru", "en"];
const CATEGORIES = ["Osh", "Manti", "Lag‘mon", "Shashlik", "Somsa"];
const MAX_IMAGE_LENGTH = 5 * 1024 * 1024;

function localized(value, field, maxLength, requiredUz = false) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${field} noto‘g‘ri`);
  const result = {};
  for (const lang of LANGS) {
    const text = typeof value[lang] === "string" ? value[lang].trim() : "";
    if (text.length > maxLength) throw new Error(`${field} juda uzun`);
    result[lang] = text;
  }
  if (requiredUz && !result.uz) throw new Error("Taom nomi kiritilishi shart");
  return result;
}

export function validateDish(input, { partial = false } = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Noto‘g‘ri ma’lumot");
  const category = String(input.category ?? "").trim();
  const price = Number(input.price);
  const position = Number(input.position ?? 0);
  const image = String(input.image ?? "").trim();
  if (!CATEGORIES.includes(category)) throw new Error("Kategoriya noto‘g‘ri");
  if (!Number.isSafeInteger(price) || price < 0 || price > 10_000_000) throw new Error("Narx noto‘g‘ri");
  if (!Number.isSafeInteger(position) || position < 0 || position > 100_000) throw new Error("Tartib raqami noto‘g‘ri");
  if (!image || image.length > MAX_IMAGE_LENGTH || (!image.startsWith("/assets/") && !/^https:\/\//i.test(image))) {
    throw new Error("Rasm PNG, JPG yoki WebP formatida va 5 MB dan kichik bo‘lishi kerak");
  }
  return {
    category,
    price,
    image,
    visible: input.visible !== false,
    position,
    names: localized(input.names, "Nom", 100, !partial),
    descriptions: localized(input.descriptions, "Tavsif", 500),
  };
}

export function jsonError(message, status = 400) {
  return Response.json({ error: message }, { status });
}
