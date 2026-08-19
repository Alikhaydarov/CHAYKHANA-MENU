"use client";

import { CaretDown, Check, Globe } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

const labels = { uz: "O‘zbekcha", ko: "한국어", ru: "Русский", en: "English" };
const shortLabels = { uz: "UZ", ko: "KO", ru: "RU", en: "EN" };

export default function LanguageMenu({ lang, ariaLabel, onSelect }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const closeOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("keydown", closeEscape);
    };
  }, []);

  const choose = (key) => {
    setOpen(false);
    if (key !== lang) onSelect(key);
  };

  return <div className={`language-menu${open ? " is-open" : ""}`} ref={rootRef}>
    <button
      type="button"
      className="language-trigger"
      aria-label={ariaLabel}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen((current) => !current)}
    >
      <Globe />
      <strong>{shortLabels[lang] || "UZ"}</strong>
      <CaretDown className="language-caret" />
    </button>

    {open && <div className="language-popover" role="menu" aria-label={ariaLabel}>
      {Object.entries(labels).map(([key, label]) => <button
        key={key}
        type="button"
        role="menuitemradio"
        aria-checked={key === lang}
        className={key === lang ? "active" : ""}
        onClick={() => choose(key)}
      >
        <span>{label}</span>
        {key === lang && <Check weight="bold" />}
      </button>)}
    </div>}
  </div>;
}
