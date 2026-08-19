"use client";

import { useLayoutEffect } from "react";
import AdminClient from "./AdminClient";

const ENDPOINTS = {
  dishes: "/api/dishes?admin=1",
  categories: "/api/categories?admin=1",
};

function responseFrom(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function sortRows(key, rows) {
  return [...rows].sort((a, b) => {
    const positionDiff = Number(a?.position || 0) - Number(b?.position || 0);
    if (positionDiff) return positionDiff;
    return String(a?.id ?? "").localeCompare(String(b?.id ?? ""));
  });
}

function getUrl(input) {
  try {
    const raw = typeof input === "string" || input instanceof URL ? input : input?.url;
    return raw ? new URL(raw, window.location.origin) : null;
  } catch {
    return null;
  }
}

function getAdminKey(url) {
  if (!url || url.origin !== window.location.origin || url.searchParams.get("admin") !== "1") return null;
  if (url.pathname === "/api/dishes") return "dishes";
  if (url.pathname === "/api/categories") return "categories";
  return null;
}

function getMutation(url, method) {
  if (!url || url.origin !== window.location.origin || method === "GET") return null;
  if (url.pathname === "/api/dishes" || url.pathname.startsWith("/api/dishes/")) {
    return { key: "dishes", id: url.pathname.split("/").filter(Boolean).at(-1) };
  }
  if (url.pathname === "/api/categories" || url.pathname.startsWith("/api/categories/")) {
    return { key: "categories", id: decodeURIComponent(url.pathname.split("/").filter(Boolean).at(-1) || "") };
  }
  return null;
}

export default function AdminFastClient() {
  useLayoutEffect(() => {
    const originalFetch = window.fetch.bind(window);
    const cache = { dishes: null, categories: null };
    const pending = { dishes: null, categories: null };
    const version = { dishes: 0, categories: 0 };

    const fetchSnapshot = async (key) => {
      if (Array.isArray(cache[key])) return { status: 200, data: cache[key] };
      if (pending[key]) return pending[key];

      const requestVersion = version[key];
      pending[key] = originalFetch(ENDPOINTS[key], { cache: "no-store" })
        .then(async (response) => {
          let data;
          try {
            data = await response.json();
          } catch {
            data = { error: "Server xatosi" };
          }
          if (response.ok && Array.isArray(data) && version[key] === requestVersion) {
            cache[key] = sortRows(key, data);
          }
          return { status: response.status, data };
        })
        .finally(() => {
          pending[key] = null;
        });

      return pending[key];
    };

    const primeOther = (key) => {
      const other = key === "dishes" ? "categories" : "dishes";
      if (!Array.isArray(cache[other]) && !pending[other]) {
        fetchSnapshot(other).catch(() => {});
      }
    };

    const updateCachedCollection = (key, method, id, data) => {
      version[key] += 1;
      if (!Array.isArray(cache[key])) return;

      if (method === "POST" && data?.id != null) {
        cache[key] = sortRows(key, [...cache[key].filter((item) => String(item.id) !== String(data.id)), data]);
        return;
      }

      if ((method === "PUT" || method === "PATCH") && data?.id != null) {
        cache[key] = sortRows(key, cache[key].map((item) => (String(item.id) === String(data.id) ? data : item)));
        return;
      }

      if (method === "DELETE") {
        cache[key] = cache[key].filter((item) => String(item.id) !== String(id));
      }
    };

    const optimizedFetch = async (input, init = {}) => {
      const url = getUrl(input);
      const method = String(init?.method || (typeof Request !== "undefined" && input instanceof Request ? input.method : "GET") || "GET").toUpperCase();
      const adminKey = method === "GET" ? getAdminKey(url) : null;

      if (adminKey) {
        primeOther(adminKey);
        const snapshot = await fetchSnapshot(adminKey);
        return responseFrom(snapshot.data, snapshot.status);
      }

      const mutation = getMutation(url, method);
      if (!mutation) return originalFetch(input, init);

      const response = await originalFetch(input, init);
      if (!response.ok) return response;

      let data = null;
      try {
        data = await response.clone().json();
      } catch {}

      updateCachedCollection(mutation.key, method, mutation.id, data);
      return response;
    };

    window.fetch = optimizedFetch;
    return () => {
      if (window.fetch === optimizedFetch) window.fetch = originalFetch;
    };
  }, []);

  return <AdminClient />;
}
