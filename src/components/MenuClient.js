"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Calculator, MagnifyingGlass, Minus, Plus, X } from "@phosphor-icons/react";
import LanguageMenu from "./LanguageMenu";

const copy = {
  uz: { welcome: "Xush kelibsiz", loading: "Menu yangilanmoqda", language: "Til", search: "Taom yoki kategoriya qidiring", all: "Barchasi", add: "Qo‘shish", selected: "Tanlangan", total: "Jami", view: "Hisobni ko‘rish", empty: "Hali taom tanlanmagan", noResult: "Taom topilmadi", categoryEmpty: "Bu kategoriyada hozircha taom yo‘q", retry: "Qayta urinish", heroMenu: "MENYU", heroSubtitle: "O‘ZBEK TAOMLARI" },
  ko: { welcome: "환영합니다", loading: "메뉴를 불러오는 중", language: "언어", search: "음식 또는 카테고리 검색", all: "전체", add: "추가", selected: "선택", total: "합계", view: "계산 보기", empty: "선택한 음식이 없습니다", noResult: "음식을 찾을 수 없습니다", categoryEmpty: "이 카테고리에는 아직 음식이 없습니다", retry: "다시 시도", heroMenu: "메뉴", heroSubtitle: "우즈베키스탄 요리" },
  ru: { welcome: "Добро пожаловать", loading: "Обновляем меню", language: "Язык", search: "Найти блюдо или категорию", all: "Все", add: "Добавить", selected: "Выбрано", total: "Итого", view: "Посмотреть счёт", empty: "Блюда не выбраны", noResult: "Блюда не найдены", categoryEmpty: "В этой категории пока нет блюд", retry: "Повторить", heroMenu: "МЕНЮ", heroSubtitle: "УЗБЕКСКАЯ КУХНЯ" },
  en: { welcome: "Welcome", loading: "Updating menu", language: "Language", search: "Search dishes or categories", all: "All", add: "Add", selected: "Selected", total: "Total", view: "View total", empty: "No dishes selected", noResult: "No dishes found", categoryEmpty: "No dishes in this category yet", retry: "Try again", heroMenu: "MENU", heroSubtitle: "UZBEK CUISINE" },
};

const labels = { uz: "O‘zbekcha", ko: "한국어", ru: "Русский", en: "English" };
const LOADER_MIN_MS = 1000;
const LOADER_EXIT_MS = 460;
const LANGUAGE_LOADER_MS = 1250;

export default function MenuClient() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesReady, setCategoriesReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingClosing, setLoadingClosing] = useState(false);
  const [languageLoading, setLanguageLoading] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState("uz");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [qty, setQty] = useState({});
  const [open, setOpen] = useState(false);
  const [detailDish, setDetailDish] = useState(null);
  const languageTimerRef = useRef(null);
  const loaderCloseTimerRef = useRef(null);

  const fetchMenu = async () => {
    const dishRequest = fetch("/api/dishes", { cache: "no-store" });
    const categoryRequest = fetch("/api/categories", { cache: "no-store" }).catch(() => null);

    const dishResponse = await dishRequest;
    const dishData = await dishResponse.json();
    if (!dishResponse.ok) throw new Error(dishData.error || "Server error");
    setDishes(dishData);

    try {
      const categoryResponse = await categoryRequest;
      if (!categoryResponse) throw new Error("Category error");
      const categoryData = await categoryResponse.json();
      if (!categoryResponse.ok) throw new Error(categoryData.error || "Category error");
      setCategories(categoryData);
      setCategoriesReady(true);
      setCategory((current) => current && categoryData.some((item) => item.id === current) ? current : (categoryData[0]?.id || ""));
    } catch {
      const fallback = [...new Set(dishData.map((dish) => dish.category))].map((id, index) => ({
        id,
        names: { uz: id, ko: "", ru: "", en: "" },
        visible: true,
        position: index,
      }));
      setCategories(fallback);
      setCategoriesReady(false);
      setCategory((current) => current && fallback.some((item) => item.id === current) ? current : (fallback[0]?.id || ""));
    }
  };

  const finishLoadingAfterMinimum = (startedAt) => {
    const elapsed = Date.now() - startedAt;
    const remaining = Math.max(0, LOADER_MIN_MS - elapsed);
    window.setTimeout(() => {
      setLoadingClosing(true);
      loaderCloseTimerRef.current = window.setTimeout(() => {
        setLoading(false);
        setLoadingClosing(false);
        loaderCloseTimerRef.current = null;
      }, LOADER_EXIT_MS);
    }, remaining);
  };

  const load = () => {
    const startedAt = Date.now();
    if (loaderCloseTimerRef.current) window.clearTimeout(loaderCloseTimerRef.current);
    setLoadingClosing(false);
    setLoading(true);
    setError("");
    fetchMenu()
      .catch(() => setError("Menu yuklanmadi"))
      .finally(() => finishLoadingAfterMinimum(startedAt));
  };

  useEffect(() => {
    const saved = localStorage.getItem("chaykahana-language");
    if (saved && labels[saved]) {
      queueMicrotask(() => setLang(saved));
      document.documentElement.lang = saved;
    }

    const startedAt = Date.now();
    fetchMenu()
      .catch(() => setError("Menu yuklanmadi"))
      .finally(() => finishLoadingAfterMinimum(startedAt));

    return () => {
      if (languageTimerRef.current) window.clearTimeout(languageTimerRef.current);
      if (loaderCloseTimerRef.current) window.clearTimeout(loaderCloseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setDetailDish(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!categories.length) {
      if (category) setCategory("");
      return;
    }
    if (!category || !categories.some((item) => item.id === category)) setCategory(categories[0].id);
  }, [categories, category]);

  const selectLanguage = (value) => {
    if (!labels[value] || value === lang) return;

    if (languageTimerRef.current) window.clearTimeout(languageTimerRef.current);
    setLang(value);
    document.documentElement.lang = value;
    localStorage.setItem("chaykahana-language", value);
    setLanguageLoading(true);
    languageTimerRef.current = window.setTimeout(() => {
      setLanguageLoading(false);
      languageTimerRef.current = null;
    }, LANGUAGE_LOADER_MS);
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

  const list = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return menuDishes.filter((dish) => {
      const categoryText = categoryMap[dish.category]?.names?.[lang] || categoryMap[dish.category]?.names?.uz || dish.category;
      const text = `${dish.names[lang] || dish.names.uz} ${dish.descriptions[lang] || dish.descriptions.uz} ${categoryText}`.toLowerCase();
      return (!category || dish.category === category) && text.includes(needle);
    });
  }, [menuDishes, category, query, lang, categoryMap]);

  const count = Object.values(qty).reduce((sum, value) => sum + value, 0);
  const total = menuDishes.reduce((sum, dish) => sum + (qty[dish.id] || 0) * dish.price, 0);
  const change = (id, amount) => setQty((current) => ({ ...current, [id]: Math.max(0, (current[id] || 0) + amount) }));
  const emptyMessage = category && !query.trim() ? t.categoryEmpty : t.noResult;

  const quantityControl = (dish, stopPropagation = false) => {
    const handle = (event, amount) => {
      if (stopPropagation) event.stopPropagation();
      change(dish.id, amount);
    };

    if (qty[dish.id]) {
      return <div className="stepper" onClick={stopPropagation ? (event) => event.stopPropagation() : undefined}>
        <button aria-label="Kamaytirish" onClick={(event) => handle(event, -1)}><Minus/></button>
        <span>{qty[dish.id]}</span>
        <button aria-label="Ko‘paytirish" onClick={(event) => handle(event, 1)}><Plus/></button>
      </div>;
    }

    return <button className="add" onClick={(event) => handle(event, 1)}><Plus/>{t.add}</button>;
  };

  if (loading || languageLoading) return <div className={`loader${languageLoading ? " language-transition-loader" : ""}${loadingClosing && !languageLoading ? " loader-closing" : ""}`}>
    <div className="loader-orbit"><div className="loader-mark">✦</div></div>
    <b>CHAYHANA</b>
    <span>{t.welcome}</span>
  </div>;

  return <main className="menu-page">
    <header className="menu-header">
      <div className="menu-brand"><span className="logo-mark">✦</span><div><b>CHAYKAHANA</b><small>O‘ZBEK TAOMLARI</small></div></div>
      <div className="header-actions">
        <LanguageMenu lang={lang} ariaLabel={t.language} onSelect={selectLanguage} />
        <button aria-label={t.total} onClick={() => setOpen(true)}><Calculator/><span>{t.total}</span>{count > 0 && <em>{count}</em>}</button>
      </div>
      <div className="menu-search"><MagnifyingGlass/><input aria-label={t.search} placeholder={t.search} value={query} onChange={(event) => setQuery(event.target.value)}/>{query && <button aria-label="Tozalash" onClick={() => setQuery("")}><X/></button>}</div>
    </header>

    <section className="menu-hero" aria-label={`${t.heroMenu} CHAYHANA`}>
      <div className="menu-hero-pattern" aria-hidden="true" />
      <div className="menu-hero-logo" aria-hidden="true" />
      <p>{t.heroMenu}</p>
      <h1>CHAYHANA</h1>
      <span>{t.heroSubtitle}</span>
    </section>

    <nav className="category-strip" aria-label="Kategoriyalar">
      {availableCategories.map((item) => <button key={item.id} className={category === item.id ? "active" : ""} onClick={() => setCategory(item.id)}>{item.names[lang] || item.names.uz || item.id}</button>)}
    </nav>

    {error ? <section className="menu-empty"><b>!</b><h2>{error}</h2><button onClick={load}>{t.retry}</button></section> : list.length === 0 ? <section className="menu-empty"><MagnifyingGlass/><h2>{emptyMessage}</h2></section> : <section className="dish-grid">
      {list.map((dish, index) => <article className="dish-card" key={dish.id}>
        <button className="dish-card-open" aria-label={`${dish.names[lang] || dish.names.uz} — ₩${dish.price.toLocaleString()}`} onClick={() => setDetailDish(dish)} />
        <div className="dish-image"><Image src={dish.image} alt={dish.names[lang] || dish.names.uz} fill sizes="(max-width: 759px) 100vw, 540px" priority={index === 0}/><span>{categoryLabel(dish.category)}</span></div>
        <div className="dish-meta"><div><h2>{dish.names[lang] || dish.names.uz}</h2><small>{dish.descriptions[lang] || dish.descriptions.uz}</small><p>₩{dish.price.toLocaleString()}</p></div>{quantityControl(dish, true)}</div>
      </article>)}
    </section>}

    {count > 0 && <footer className="calc-bar"><div><Calculator/><span><small>{t.selected}</small><b>{count}</b></span></div><div><small>{t.total}</small><b>₩{total.toLocaleString()}</b></div><button onClick={() => setOpen(true)}>{t.view}</button></footer>}

    {detailDish && <div className="sheet-backdrop" onClick={() => setDetailDish(null)}>
      <section className="dish-detail-sheet" role="dialog" aria-modal="true" aria-label={detailDish.names[lang] || detailDish.names.uz} onClick={(event) => event.stopPropagation()}>
        <button className="dish-detail-close" aria-label="Yopish" onClick={() => setDetailDish(null)}><X/></button>
        <div className="dish-detail-image">
          <Image src={detailDish.image} alt={detailDish.names[lang] || detailDish.names.uz} fill sizes="(max-width: 620px) 100vw, 620px"/>
          <span>{categoryLabel(detailDish.category)}</span>
        </div>
        <div className="dish-detail-content">
          <h2>{detailDish.names[lang] || detailDish.names.uz}</h2>
          <p>{detailDish.descriptions[lang] || detailDish.descriptions.uz || categoryLabel(detailDish.category)}</p>
          <div className="dish-detail-footer">
            <strong className="dish-detail-price">₩{detailDish.price.toLocaleString()}</strong>
            {quantityControl(detailDish)}
          </div>
        </div>
      </section>
    </div>}

    {open && <div className="sheet-backdrop" onClick={() => setOpen(false)}><div className="calc-sheet" role="dialog" aria-modal="true" aria-label={t.view} onClick={(event) => event.stopPropagation()}><div className="sheet-handle"/><button className="sheet-close" aria-label="Yopish" onClick={() => setOpen(false)}><X/></button><h2>{t.view}</h2>{count === 0 ? <p>{t.empty}</p> : menuDishes.filter((dish) => qty[dish.id]).map((dish) => <div className="calc-row" key={dish.id}><span>{dish.names[lang] || dish.names.uz} × {qty[dish.id]}</span><b>₩{(dish.price * qty[dish.id]).toLocaleString()}</b></div>)}<div className="calc-total"><span>{t.total}</span><b>₩{total.toLocaleString()}</b></div></div></div>}
  </main>;
}
