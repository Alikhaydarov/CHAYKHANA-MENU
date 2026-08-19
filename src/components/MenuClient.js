"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Calculator, Globe, MagnifyingGlass, Minus, Plus, X } from "@phosphor-icons/react";

const copy = {
  uz: { welcome: "Xush kelibsiz", search: "Taom yoki kategoriya qidiring", all: "Barchasi", add: "Qo‘shish", selected: "Tanlangan", total: "Jami", view: "Hisobni ko‘rish", empty: "Hali taom tanlanmagan", noResult: "Taom topilmadi", retry: "Qayta urinish" },
  ko: { welcome: "환영합니다", search: "음식 또는 카테고리 검색", all: "전체", add: "추가", selected: "선택", total: "합계", view: "계산 보기", empty: "선택한 음식이 없습니다", noResult: "음식을 찾을 수 없습니다", retry: "다시 시도" },
  ru: { welcome: "Добро пожаловать", search: "Найти блюдо или категорию", all: "Все", add: "Добавить", selected: "Выбрано", total: "Итого", view: "Посмотреть счёт", empty: "Блюда не выбраны", noResult: "Блюда не найдены", retry: "Повторить" },
  en: { welcome: "Welcome", search: "Search dishes or categories", all: "All", add: "Add", selected: "Selected", total: "Total", view: "View total", empty: "No dishes selected", noResult: "No dishes found", retry: "Try again" },
};

const labels = { uz: "UZ", ko: "한국어", ru: "RU", en: "EN" };

export default function MenuClient() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesReady, setCategoriesReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lang, setLang] = useState("uz");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [qty, setQty] = useState({});
  const [open, setOpen] = useState(false);

  const fetchMenu = async () => {
    const dishResponse = await fetch("/api/dishes", { cache: "no-store" });
    const dishData = await dishResponse.json();
    if (!dishResponse.ok) throw new Error(dishData.error || "Server error");
    setDishes(dishData);

    try {
      const categoryResponse = await fetch("/api/categories", { cache: "no-store" });
      const categoryData = await categoryResponse.json();
      if (!categoryResponse.ok) throw new Error(categoryData.error || "Category error");
      setCategories(categoryData);
      setCategoriesReady(true);
    } catch {
      const fallback = [...new Set(dishData.map((dish) => dish.category))].map((id, index) => ({
        id,
        names: { uz: id, ko: "", ru: "", en: "" },
        visible: true,
        position: index,
      }));
      setCategories(fallback);
      setCategoriesReady(false);
    }
  };

  const load = () => {
    setLoading(true);
    setError("");
    fetchMenu().catch(() => setError("Menu yuklanmadi")).finally(() => setTimeout(() => setLoading(false), 550));
  };

  useEffect(() => {
    const saved = localStorage.getItem("chaykahana-language");
    if (saved && labels[saved]) queueMicrotask(() => setLang(saved));
    fetchMenu().catch(() => setError("Menu yuklanmadi")).finally(() => setTimeout(() => setLoading(false), 550));
  }, []);

  const selectLanguage = (value) => {
    setLang(value);
    localStorage.setItem("chaykahana-language", value);
  };

  const categoryMap = useMemo(() => Object.fromEntries(categories.map((item) => [item.id, item])), [categories]);

  const menuDishes = useMemo(() => {
    if (!categoriesReady) return dishes;
    return dishes.filter((dish) => Boolean(categoryMap[dish.category]));
  }, [dishes, categoriesReady, categoryMap]);

  const categoryLabel = (id) => {
    const item = categoryMap[id];
    return item?.names?.[lang] || item?.names?.uz || id;
  };

  const availableCategories = categories;

  const t = copy[lang];
  const list = useMemo(
    () => menuDishes.filter((dish) => {
      const categoryText = categoryMap[dish.category]?.names?.[lang] || categoryMap[dish.category]?.names?.uz || dish.category;
      const text = `${dish.names[lang] || dish.names.uz} ${dish.descriptions[lang] || dish.descriptions.uz} ${categoryText}`.toLowerCase();
      return (category === "all" || dish.category === category) && text.includes(query.toLowerCase());
    }),
    [menuDishes, category, query, lang, categoryMap],
  );

  const count = Object.values(qty).reduce((sum, value) => sum + value, 0);
  const total = menuDishes.reduce((sum, dish) => sum + (qty[dish.id] || 0) * dish.price, 0);
  const change = (id, amount) => setQty((current) => ({ ...current, [id]: Math.max(0, (current[id] || 0) + amount) }));

  if (loading) return <div className="loader"><div className="loader-orbit"><div className="loader-mark">✦</div></div><b>CHAYKAHANA</b><span>{t.welcome}</span></div>;

  return <main className="menu-page">
    <header className="menu-header">
      <div className="menu-brand"><span className="logo-mark">✦</span><div><b>CHAYKAHANA</b><small>O‘ZBEK TAOMLARI</small></div></div>
      <div className="header-actions">
        <label aria-label="Til"><Globe/><select value={lang} onChange={(event) => selectLanguage(event.target.value)}>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <button aria-label={t.total} onClick={() => setOpen(true)}><Calculator/><span>{t.total}</span>{count > 0 && <em>{count}</em>}</button>
      </div>
      <div className="menu-search"><MagnifyingGlass/><input aria-label={t.search} placeholder={t.search} value={query} onChange={(event) => setQuery(event.target.value)}/>{query && <button aria-label="Tozalash" onClick={() => setQuery("")}><X/></button>}</div>
    </header>

    <nav className="category-strip">
      <button className={category === "all" ? "active" : ""} onClick={() => setCategory("all")}>{t.all}</button>
      {availableCategories.map((item) => <button key={item.id} className={category === item.id ? "active" : ""} onClick={() => setCategory(item.id)}>{item.names[lang] || item.names.uz || item.id}</button>)}
    </nav>

    {error ? <section className="menu-empty"><b>!</b><h2>{error}</h2><button onClick={load}>{t.retry}</button></section> : list.length === 0 ? <section className="menu-empty"><MagnifyingGlass/><h2>{t.noResult}</h2></section> : <section className="dish-grid">
      {list.map((dish, index) => <article className="dish-card" key={dish.id}>
        <div className="dish-image"><Image src={dish.image} alt={dish.names[lang] || dish.names.uz} fill sizes="(max-width: 900px) 100vw, 880px" priority={index === 0}/><span>{categoryLabel(dish.category)}</span></div>
        <div className="dish-meta"><div><h2>{dish.names[lang] || dish.names.uz}</h2><small>{dish.descriptions[lang] || dish.descriptions.uz}</small><p>₩{dish.price.toLocaleString()}</p></div>{qty[dish.id] ? <div className="stepper"><button aria-label="Kamaytirish" onClick={() => change(dish.id, -1)}><Minus/></button><span>{qty[dish.id]}</span><button aria-label="Ko‘paytirish" onClick={() => change(dish.id, 1)}><Plus/></button></div> : <button className="add" onClick={() => change(dish.id, 1)}><Plus/>{t.add}</button>}</div>
      </article>)}
    </section>}

    {count > 0 && <footer className="calc-bar"><div><Calculator/><span><small>{t.selected}</small><b>{count}</b></span></div><div><small>{t.total}</small><b>₩{total.toLocaleString()}</b></div><button onClick={() => setOpen(true)}>{t.view}</button></footer>}
    {open && <div className="sheet-backdrop" onClick={() => setOpen(false)}><div className="calc-sheet" onClick={(event) => event.stopPropagation()}><div className="sheet-handle"/><button className="sheet-close" onClick={() => setOpen(false)}><X/></button><h2>{t.view}</h2>{count === 0 ? <p>{t.empty}</p> : menuDishes.filter((dish) => qty[dish.id]).map((dish) => <div className="calc-row" key={dish.id}><span>{dish.names[lang] || dish.names.uz} × {qty[dish.id]}</span><b>₩{(dish.price * qty[dish.id]).toLocaleString()}</b></div>)}<div className="calc-total"><span>{t.total}</span><b>₩{total.toLocaleString()}</b></div></div></div>}
  </main>;
}
