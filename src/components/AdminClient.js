"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowSquareOut,
  BowlFood,
  CheckCircle,
  Eye,
  EyeSlash,
  FloppyDisk,
  House,
  ImageSquare,
  MagnifyingGlass,
  Plus,
  SignOut,
  SpinnerGap,
  SquaresFour,
  Trash,
  WarningCircle,
} from "@phosphor-icons/react";
import styles from "./AdminClient.module.css";

const langs = { uz: "UZ", ko: "한국어", ru: "RU", en: "EN" };
const emptyNames = { uz: "", ko: "", ru: "", en: "" };
const newDish = (category) => ({
  category: category || "Osh",
  price: 0,
  image: "/assets/osh.png",
  visible: true,
  position: 0,
  names: { ...emptyNames, uz: "Yangi taom" },
  descriptions: { ...emptyNames },
});
const newCategory = () => ({
  visible: true,
  position: 0,
  names: { ...emptyNames, uz: "Yangi kategoriya" },
});

const viewCopy = {
  dashboard: {
    eyebrow: "Boshqaruv paneli",
    title: "Dashboard",
    subtitle: "Menyu holatini bir joydan kuzating va boshqaring.",
  },
  dishes: {
    eyebrow: "Menyu boshqaruvi",
    title: "Taomlar",
    subtitle: "Taomlarni qo‘shing, tahrirlang va ko‘rinishini boshqaring.",
  },
  categories: {
    eyebrow: "Menyu tuzilmasi",
    title: "Kategoriyalar",
    subtitle: "Kategoriya nomlari, tartibi va ko‘rinishini boshqaring.",
  },
};

export default function AdminClient() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryDraft, setCategoryDraft] = useState(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [lang, setLang] = useState("uz");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [mobileEdit, setMobileEdit] = useState(false);

  const api = async (url, options) => {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Server xatosi");
    return data;
  };

  const load = useCallback(async () => {
    const dishes = await api("/api/dishes?admin=1", { cache: "no-store" });
    setItems(dishes);
    setError("");

    let cats = [];
    try {
      cats = await api("/api/categories?admin=1", { cache: "no-store" });
      setCategories(cats);
      setCategoryError("");
    } catch (categoryLoadError) {
      setCategories([]);
      setCategoryError(categoryLoadError.message);
    }

    return { dishes, cats };
  }, []);

  useEffect(() => {
    load()
      .then(({ dishes, cats }) => {
        if (dishes[0]) {
          setSelectedId(dishes[0].id);
          setDraft(structuredClone(dishes[0]));
        }
        if (cats[0]) {
          setSelectedCategoryId(cats[0].id);
          setCategoryDraft(structuredClone(cats[0]));
        }
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, [load]);

  const fallbackCategories = useMemo(
    () =>
      [...new Set(items.map((item) => item.category))].map((id, index) => ({
        id,
        names: { ...emptyNames, uz: id },
        visible: true,
        position: 1000 + index,
      })),
    [items]
  );

  const dishCategories = categories.length ? categories : fallbackCategories;

  const categoryName = useCallback(
    (id, language = "uz") => {
      const category = dishCategories.find((item) => item.id === id);
      return category?.names?.[language] || category?.names?.uz || id;
    },
    [dishCategories]
  );

  const categoryCounts = useMemo(
    () =>
      items.reduce((result, item) => {
        result[item.category] = (result[item.category] || 0) + 1;
        return result;
      }, {}),
    [items]
  );

  const filteredItems = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const searchable = `${item.names?.uz || ""} ${categoryName(item.category)}`.toLowerCase();
      const matchesQuery = !needle || searchable.includes(needle);
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [items, query, categoryFilter, categoryName]);

  const toast = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 1900);
  };

  const act = async (fn, success) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      toast(success);
    } catch (actionError) {
      toast(actionError.message);
    } finally {
      setBusy(false);
    }
  };

  const switchView = (nextView) => {
    setView(nextView);
    setMobileEdit(false);
    setNotice("");
  };

  const selectDish = (dish) => {
    setSelectedId(dish.id);
    setDraft(structuredClone(dish));
    setMobileEdit(true);
  };

  const selectCategory = (category) => {
    setSelectedCategoryId(category.id);
    setCategoryDraft(structuredClone(category));
    setMobileEdit(true);
  };

  const saveDish = () =>
    act(async () => {
      const updated = await api(`/api/dishes/${draft.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      await load();
      setDraft(updated);
    }, "Taom saqlandi");

  const addDish = () =>
    act(async () => {
      const created = await api("/api/dishes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(newDish(dishCategories[0]?.id || "Osh")),
      });
      await load();
      setSelectedId(created.id);
      setDraft(created);
      setMobileEdit(true);
      setView("dishes");
    }, "Yangi taom qo‘shildi");

  const removeDish = async () => {
    if (!confirm("Taom o‘chirilsinmi?")) return;
    act(async () => {
      await api(`/api/dishes/${draft.id}`, { method: "DELETE" });
      const { dishes } = await load();
      setSelectedId(dishes[0]?.id ?? null);
      setDraft(dishes[0] ? structuredClone(dishes[0]) : null);
      setMobileEdit(false);
    }, "Taom o‘chirildi");
  };

  const saveCategory = () =>
    act(async () => {
      const updated = await api(`/api/categories/${encodeURIComponent(categoryDraft.id)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(categoryDraft),
      });
      await load();
      setSelectedCategoryId(updated.id);
      setCategoryDraft(updated);
    }, "Kategoriya saqlandi");

  const addCategory = () =>
    act(async () => {
      const created = await api("/api/categories", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(newCategory()),
      });
      await load();
      setSelectedCategoryId(created.id);
      setCategoryDraft(created);
      setMobileEdit(true);
      setView("categories");
    }, "Yangi kategoriya qo‘shildi");

  const removeCategory = async () => {
    if (!confirm("Kategoriya o‘chirilsinmi?")) return;
    act(async () => {
      await api(`/api/categories/${encodeURIComponent(categoryDraft.id)}`, {
        method: "DELETE",
      });
      const { cats } = await load();
      setSelectedCategoryId(cats[0]?.id ?? null);
      setCategoryDraft(cats[0] ? structuredClone(cats[0]) : null);
      setMobileEdit(false);
    }, "Kategoriya o‘chirildi");
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.set("file", file);
    await act(async () => {
      const data = await api("/api/uploads", { method: "POST", body: form });
      setDraft((current) => ({ ...current, image: data.url }));
    }, "Rasm yuklandi");
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <SpinnerGap className={styles.spin} size={30} />
        <b>Admin panel yuklanmoqda</b>
        <span>Ma’lumotlar tayyorlanmoqda…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.loadingState}>
        <WarningCircle size={32} />
        <b>{error}</b>
        <button onClick={() => location.reload()}>Qayta urinish</button>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: House },
    { id: "dishes", label: "Taomlar", icon: BowlFood },
    { id: "categories", label: "Kategoriyalar", icon: SquaresFour },
  ];

  const sidebar = (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>✦</span>
        <div>
          <b>CHAYKAHANA</b>
          <small>ADMIN PANEL</small>
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        <span className={styles.navLabel}>BOSHQARUV</span>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={view === id ? styles.navActive : ""}
            onClick={() => switchView(id)}
          >
            <Icon size={20} weight={view === id ? "fill" : "regular"} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <Link href="/" className={styles.menuLink}>
          <ArrowSquareOut size={19} />
          <span>Menyuni ko‘rish</span>
        </Link>
        <button className={styles.logoutButton} onClick={logout}>
          <SignOut size={19} />
          <span>Chiqish</span>
        </button>
      </div>
    </aside>
  );

  const pageHeader = (
    <>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>{viewCopy[view].eyebrow}</span>
          <h1>{viewCopy[view].title}</h1>
          <p>{viewCopy[view].subtitle}</p>
        </div>
        <div className={styles.topbarActions}>
          <Link href="/" className={styles.previewButton}>
            <Eye size={18} />
            Preview
          </Link>
          {view === "dishes" && (
            <button className={styles.primaryButton} disabled={busy || !dishCategories.length} onClick={addDish}>
              <Plus size={18} weight="bold" />
              Yangi taom
            </button>
          )}
          {view === "categories" && (
            <button className={styles.primaryButton} disabled={busy || Boolean(categoryError)} onClick={addCategory}>
              <Plus size={18} weight="bold" />
              Yangi kategoriya
            </button>
          )}
        </div>
      </header>

      <nav className={styles.mobileNav}>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={view === id ? styles.mobileNavActive : ""}
            onClick={() => switchView(id)}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
    </>
  );

  const renderDashboard = () => {
    const visibleDishes = items.filter((item) => item.visible).length;
    const hiddenDishes = items.length - visibleDishes;
    const visibleCategories = categories.filter((item) => item.visible).length;

    const metrics = [
      { label: "Jami taomlar", value: items.length, note: `${visibleDishes} tasi aktiv`, icon: BowlFood },
      { label: "Ko‘rinadigan", value: visibleDishes, note: "Menyuda ko‘rinadi", icon: Eye },
      { label: "Yashirin", value: hiddenDishes, note: "Menyudan yashirilgan", icon: EyeSlash },
      { label: "Kategoriyalar", value: categories.length || fallbackCategories.length, note: `${visibleCategories || fallbackCategories.length} tasi aktiv`, icon: SquaresFour },
    ];

    return (
      <div className={styles.dashboardScroll}>
        {categoryError && (
          <div className={styles.warningCard}>
            <WarningCircle size={22} />
            <div>
              <b>Kategoriya bazasi hali ulanmagan</b>
              <span>Supabase’da yangilangan <code>supabase/migration.sql</code> faylini bir marta ishga tushiring.</span>
            </div>
          </div>
        )}

        <section className={styles.metricsGrid}>
          {metrics.map(({ label, value, note, icon: Icon }) => (
            <article className={styles.metricCard} key={label}>
              <div className={styles.metricIcon}><Icon size={21} /></div>
              <div className={styles.metricValue}>{value}</div>
              <b>{label}</b>
              <span>{note}</span>
            </article>
          ))}
        </section>

        <section className={styles.dashboardGrid}>
          <article className={styles.surfaceCard}>
            <div className={styles.cardHeading}>
              <div>
                <span className={styles.sectionKicker}>MENYU TUZILMASI</span>
                <h2>Kategoriyalar bo‘yicha taomlar</h2>
              </div>
              <button className={styles.textButton} onClick={() => switchView("categories")}>Boshqarish</button>
            </div>
            <div className={styles.categoryOverview}>
              {(categories.length ? categories : fallbackCategories).map((category) => {
                const count = categoryCounts[category.id] || 0;
                const percent = items.length ? Math.round((count / items.length) * 100) : 0;
                return (
                  <div className={styles.overviewRow} key={category.id}>
                    <div className={styles.overviewLabel}>
                      <span>{category.names?.uz || category.id}</span>
                      <b>{count} ta</b>
                    </div>
                    <div className={styles.progressTrack}>
                      <span style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
              {!dishCategories.length && <div className={styles.emptyInline}>Hali kategoriya yo‘q.</div>}
            </div>
          </article>

          <article className={styles.surfaceCard}>
            <div className={styles.cardHeading}>
              <div>
                <span className={styles.sectionKicker}>TEZKOR AMALLAR</span>
                <h2>Menyuni tez boshqaring</h2>
              </div>
            </div>
            <div className={styles.quickActions}>
              <button onClick={addDish} disabled={busy || !dishCategories.length}>
                <span className={styles.quickIcon}><Plus size={20} /></span>
                <span><b>Yangi taom</b><small>Menyuga yangi pozitsiya qo‘shing</small></span>
              </button>
              <button onClick={addCategory} disabled={busy || Boolean(categoryError)}>
                <span className={styles.quickIcon}><SquaresFour size={20} /></span>
                <span><b>Yangi kategoriya</b><small>Menyu bo‘limini yarating</small></span>
              </button>
              <button onClick={() => switchView("dishes")}>
                <span className={styles.quickIcon}><BowlFood size={20} /></span>
                <span><b>Taomlarni tahrirlash</b><small>Narx va ma’lumotlarni yangilang</small></span>
              </button>
            </div>
          </article>
        </section>
      </div>
    );
  };

  const renderDishEditor = () => {
    if (!draft) {
      return (
        <div className={styles.emptyState}>
          <BowlFood size={38} />
          <h3>Hali taom yo‘q</h3>
          <p>Birinchi taomni qo‘shib menyuni to‘ldirishni boshlang.</p>
          <button className={styles.primaryButton} onClick={addDish}><Plus size={18}/>Birinchi taom</button>
        </div>
      );
    }

    return (
      <>
        <div className={styles.editorHeader}>
          <button className={styles.backButton} onClick={() => setMobileEdit(false)} aria-label="Orqaga">
            <ArrowLeft size={19} />
          </button>
          <div className={styles.editorTitle}>
            <span className={styles.sectionKicker}>TAOM TAHRIRI</span>
            <h2>{draft.names?.uz || "Taom"}</h2>
          </div>
          <div className={styles.editorActions}>
            <button className={styles.dangerButton} disabled={busy} onClick={removeDish}>
              <Trash size={18} />O‘chirish
            </button>
            <button className={styles.primaryButton} disabled={busy} onClick={saveDish}>
              {busy ? <SpinnerGap className={styles.spin} size={18}/> : <FloppyDisk size={18}/>}
              Saqlash
            </button>
          </div>
        </div>

        <div className={styles.editorScroll}>
          <section className={styles.formSection}>
            <div className={styles.formSectionHeading}>
              <div>
                <h3>Asosiy ma’lumotlar</h3>
                <p>Taom rasmi, kategoriya, narx va holatini boshqaring.</p>
              </div>
            </div>

            <div className={styles.dishFormGrid}>
              <div>
                <label className={styles.fieldLabel}>Taom rasmi</label>
                <div className={styles.imagePreview}>
                  <Image src={draft.image} fill sizes="(max-width: 720px) 100vw, 430px" alt={draft.names?.uz || "Taom"} />
                  <label className={styles.imageUpload}>
                    <ImageSquare size={18} />
                    Rasmni almashtirish
                    <input disabled={busy} type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadImage} />
                  </label>
                </div>
              </div>

              <div className={styles.formStack}>
                <label className={styles.field}>
                  <span>Kategoriya</span>
                  <select value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}>
                    {!dishCategories.some((category) => category.id === draft.category) && <option value={draft.category}>{draft.category}</option>}
                    {dishCategories.map((category) => <option key={category.id} value={category.id}>{category.names?.uz || category.id}</option>)}
                  </select>
                </label>

                <label className={styles.field}>
                  <span>Narx (₩)</span>
                  <input min="0" max="10000000" type="number" value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: Number(event.target.value) }))} />
                </label>

                <label className={styles.field}>
                  <span>Tartib raqami</span>
                  <input min="0" max="100000" type="number" value={draft.position} onChange={(event) => setDraft((current) => ({ ...current, position: Number(event.target.value) }))} />
                </label>

                <div className={styles.field}>
                  <span>Ko‘rinish</span>
                  <button
                    type="button"
                    className={`${styles.visibilityToggle} ${draft.visible ? styles.isVisible : ""}`}
                    onClick={() => setDraft((current) => ({ ...current, visible: !current.visible }))}
                  >
                    {draft.visible ? <Eye size={19}/> : <EyeSlash size={19}/>}
                    <span>
                      <b>{draft.visible ? "Ko‘rinadi" : "Yashirin"}</b>
                      <small>{draft.visible ? "Mijozlar menyuda ko‘radi" : "Menyuda ko‘rsatilmaydi"}</small>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.formSectionHeading}>
              <div>
                <h3>Til va kontent</h3>
                <p>Taom nomi va tavsifini har bir til uchun alohida kiriting.</p>
              </div>
            </div>

            <div className={styles.languageTabs}>
              {Object.entries(langs).map(([key, label]) => (
                <button key={key} className={lang === key ? styles.languageActive : ""} onClick={() => setLang(key)}>
                  {label}
                </button>
              ))}
            </div>

            <div className={styles.localeGrid}>
              <label className={styles.field}>
                <span>Nomi ({langs[lang]})</span>
                <input value={draft.names?.[lang] || ""} onChange={(event) => setDraft((current) => ({ ...current, names: { ...current.names, [lang]: event.target.value } }))} />
              </label>
              <label className={styles.field}>
                <span>Tavsif ({langs[lang]})</span>
                <textarea value={draft.descriptions?.[lang] || ""} onChange={(event) => setDraft((current) => ({ ...current, descriptions: { ...current.descriptions, [lang]: event.target.value } }))} />
              </label>
            </div>
          </section>
        </div>
      </>
    );
  };

  const renderDishes = () => (
    <div className={`${styles.splitLayout} ${mobileEdit ? styles.mobileEdit : ""}`}>
      <section className={`${styles.panel} ${styles.listPanel}`}>
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.sectionKicker}>TAOMLAR RO‘YXATI</span>
            <h2>{filteredItems.length} ta natija</h2>
          </div>
          <button className={styles.iconPrimary} disabled={busy || !dishCategories.length} onClick={addDish} aria-label="Yangi taom">
            <Plus size={19} weight="bold" />
          </button>
        </div>

        <div className={styles.filters}>
          <label className={styles.searchBox}>
            <MagnifyingGlass size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Taom qidirish…" />
          </label>
          <select className={styles.filterSelect} value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">Barcha kategoriyalar</option>
            {dishCategories.map((category) => <option key={category.id} value={category.id}>{category.names?.uz || category.id}</option>)}
          </select>
        </div>

        <div className={styles.listScroll}>
          {filteredItems.map((dish) => (
            <button
              key={dish.id}
              className={`${styles.listRow} ${dish.id === selectedId ? styles.listRowActive : ""}`}
              onClick={() => selectDish(dish)}
            >
              <span className={styles.dishThumb}>
                <Image src={dish.image} fill sizes="58px" alt="" />
              </span>
              <span className={styles.rowMain}>
                <b>{dish.names?.uz || "Nomsiz taom"}</b>
                <small>{categoryName(dish.category)} · ₩{dish.price.toLocaleString()}</small>
              </span>
              <span className={`${styles.statusDot} ${dish.visible ? styles.statusOn : ""}`} title={dish.visible ? "Ko‘rinadi" : "Yashirin"} />
            </button>
          ))}
          {!filteredItems.length && (
            <div className={styles.listEmpty}>
              <MagnifyingGlass size={28} />
              <b>Taom topilmadi</b>
              <span>Qidiruv yoki filterni o‘zgartirib ko‘ring.</span>
            </div>
          )}
        </div>
      </section>

      <section className={`${styles.panel} ${styles.editorPanel}`}>
        {renderDishEditor()}
      </section>
    </div>
  );

  const renderCategoryEditor = () => {
    if (!categoryDraft) {
      return (
        <div className={styles.emptyState}>
          <SquaresFour size={38} />
          <h3>Hali kategoriya yo‘q</h3>
          <p>Menyuni bo‘limlarga ajratish uchun kategoriya yarating.</p>
          <button className={styles.primaryButton} onClick={addCategory}><Plus size={18}/>Birinchi kategoriya</button>
        </div>
      );
    }

    return (
      <>
        <div className={styles.editorHeader}>
          <button className={styles.backButton} onClick={() => setMobileEdit(false)} aria-label="Orqaga">
            <ArrowLeft size={19} />
          </button>
          <div className={styles.editorTitle}>
            <span className={styles.sectionKicker}>KATEGORIYA TAHRIRI</span>
            <h2>{categoryDraft.names?.uz || categoryDraft.id}</h2>
          </div>
          <div className={styles.editorActions}>
            <button className={styles.dangerButton} disabled={busy} onClick={removeCategory}>
              <Trash size={18} />O‘chirish
            </button>
            <button className={styles.primaryButton} disabled={busy} onClick={saveCategory}>
              {busy ? <SpinnerGap className={styles.spin} size={18}/> : <FloppyDisk size={18}/>}
              Saqlash
            </button>
          </div>
        </div>

        <div className={styles.editorScroll}>
          <section className={styles.formSection}>
            <div className={styles.formSectionHeading}>
              <div>
                <h3>Asosiy sozlamalar</h3>
                <p>Kategoriyaning ichki identifikatori, tartibi va holati.</p>
              </div>
            </div>

            <div className={styles.categoryFormGrid}>
              <label className={styles.field}>
                <span>Ichki ID</span>
                <input value={categoryDraft.id} disabled />
                <small className={styles.fieldHint}>ID taomlar bilan bog‘langanligi uchun o‘zgartirilmaydi.</small>
              </label>

              <label className={styles.field}>
                <span>Tartib raqami</span>
                <input min="0" max="100000" type="number" value={categoryDraft.position} onChange={(event) => setCategoryDraft((current) => ({ ...current, position: Number(event.target.value) }))} />
              </label>

              <div className={styles.field}>
                <span>Ko‘rinish</span>
                <button
                  type="button"
                  className={`${styles.visibilityToggle} ${categoryDraft.visible ? styles.isVisible : ""}`}
                  onClick={() => setCategoryDraft((current) => ({ ...current, visible: !current.visible }))}
                >
                  {categoryDraft.visible ? <Eye size={19}/> : <EyeSlash size={19}/>}
                  <span>
                    <b>{categoryDraft.visible ? "Ko‘rinadi" : "Yashirin"}</b>
                    <small>{categoryDraft.visible ? "Menyuda kategoriya aktiv" : "Menyuda ko‘rsatilmaydi"}</small>
                  </span>
                </button>
              </div>
            </div>
          </section>

          <section className={styles.formSection}>
            <div className={styles.formSectionHeading}>
              <div>
                <h3>Kategoriya nomi</h3>
                <p>Har bir til uchun mijozga ko‘rinadigan nomni kiriting.</p>
              </div>
            </div>

            <div className={styles.languageTabs}>
              {Object.entries(langs).map(([key, label]) => (
                <button key={key} className={lang === key ? styles.languageActive : ""} onClick={() => setLang(key)}>
                  {label}
                </button>
              ))}
            </div>

            <label className={styles.field}>
              <span>Nomi ({langs[lang]})</span>
              <input value={categoryDraft.names?.[lang] || ""} onChange={(event) => setCategoryDraft((current) => ({ ...current, names: { ...current.names, [lang]: event.target.value } }))} />
            </label>
          </section>
        </div>
      </>
    );
  };

  const renderCategories = () => (
    <div className={`${styles.splitLayout} ${mobileEdit ? styles.mobileEdit : ""}`}>
      <section className={`${styles.panel} ${styles.listPanel}`}>
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.sectionKicker}>KATEGORIYALAR</span>
            <h2>{categories.length} ta kategoriya</h2>
          </div>
          <button className={styles.iconPrimary} disabled={busy || Boolean(categoryError)} onClick={addCategory} aria-label="Yangi kategoriya">
            <Plus size={19} weight="bold" />
          </button>
        </div>

        {categoryError ? (
          <div className={styles.categoryError}>
            <WarningCircle size={30} />
            <b>Kategoriyalar bazasi tayyor emas</b>
            <span>{categoryError}</span>
            <small>Supabase’da yangilangan migration.sql faylini ishga tushiring.</small>
          </div>
        ) : (
          <div className={styles.listScroll}>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`${styles.listRow} ${category.id === selectedCategoryId ? styles.listRowActive : ""}`}
                onClick={() => selectCategory(category)}
              >
                <span className={styles.categoryGlyph}>#</span>
                <span className={styles.rowMain}>
                  <b>{category.names?.uz || category.id}</b>
                  <small>{categoryCounts[category.id] || 0} ta taom · Tartib {category.position}</small>
                </span>
                <span className={`${styles.statusDot} ${category.visible ? styles.statusOn : ""}`} title={category.visible ? "Ko‘rinadi" : "Yashirin"} />
              </button>
            ))}
            {!categories.length && (
              <div className={styles.listEmpty}>
                <SquaresFour size={28} />
                <b>Kategoriya yo‘q</b>
                <span>Yangi kategoriya yaratib boshlang.</span>
              </div>
            )}
          </div>
        )}
      </section>

      <section className={`${styles.panel} ${styles.editorPanel}`}>
        {categoryError ? (
          <div className={styles.emptyState}>
            <WarningCircle size={38} />
            <h3>Migration kerak</h3>
            <p>Category boshqaruvini ishlatish uchun Supabase migration’ni ishga tushiring.</p>
          </div>
        ) : renderCategoryEditor()}
      </section>
    </div>
  );

  return (
    <main className={styles.shell}>
      {sidebar}
      <section className={styles.workspace}>
        {pageHeader}
        <div className={styles.content}>
          {view === "dashboard" && renderDashboard()}
          {view === "dishes" && renderDishes()}
          {view === "categories" && renderCategories()}
        </div>
      </section>

      {notice && (
        <div className={styles.toast}>
          <CheckCircle size={20} weight="fill" />
          {notice}
        </div>
      )}
    </main>
  );
}
