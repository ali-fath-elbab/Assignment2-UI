// ui.js - shared layout, cards, skeletons and global button behaviour.

import { getTheme, saveTheme, isFavorite, toggleFavorite } from "./storage.js";

export const formatPrice = (value) => `$${Number(value).toLocaleString()}`;

const paths = {
  laptop: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M2 20h20"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0 0-7.8Z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  ram: '<rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 17v3M10 17v3M14 17v3M18 17v3M6 7V4M10 7V4M14 7V4M18 7V4"/>',
  storage: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  battery: '<rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 10v4M6 10v4M10 10v4M14 10v4"/>',
  weight: '<path d="M6.5 8a7 7 0 1 1 11 0M4 8h16l-2 12H6L4 8Z"/><circle cx="12" cy="14" r="2"/>',
  screen: '<rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/>',
  tag: '<path d="M20 12 12 20 3 11V3h8l9 9Z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
  sparkles: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7L19 17Z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  alert: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 9v5M12 17h.01"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  sliders: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
};

export function icon(name, className = "h-4 w-4") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="${className}" aria-hidden="true">${paths[name] || ""}</svg>`;
}

let eventsReady = false;

const navItems = [
  { page: "home", href: "index.html", label: "Home" },
  { page: "laptops", href: "laptops.html", label: "Catalogue" },
  { page: "details", href: "details.html?id=7", label: "Details" },
  { page: "favorites", href: "favorites.html", label: "Favorites" },
  { page: "compare", href: "compare.html", label: "Compare" },
];

function headerHtml(active) {
  const links = navItems
    .map((item) => {
      const current = item.page === active;
      return `<a href="${item.href}" ${current ? 'aria-current="page"' : ""}
        class="rounded-xl px-3 py-2 text-sm font-bold text-app-muted transition duration-200 hover:bg-app-surface-2 hover:text-app-accent focus:outline-none focus:ring-2 focus:ring-app-accent ${current ? "bg-app-accent-soft text-app-accent shadow-sm" : ""}">
        ${item.label}</a>`;
    })
    .join("");

  return `
    <header class="sticky top-0 z-50 border-b border-app-border/80 bg-app-surface/90 backdrop-blur-lg">
      <div class="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <a href="index.html" class="group flex items-center gap-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-app-accent">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-app-accent to-app-accent-hover text-app-on-accent shadow-md shadow-app-accent/30 transition duration-200 group-hover:scale-105">
              ${icon("laptop", "h-5 w-5")}
            </span>
            <span class="leading-tight">
              <span class="block text-sm font-black tracking-tight sm:text-base">Laptop Finder</span>
              <span class="block text-[10px] font-extrabold uppercase tracking-widest text-app-muted">SW302 &middot; Student edition</span>
            </span>
          </a>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1 rounded-xl border border-app-border bg-app-surface-2/70 p-1 shadow-sm" role="group" aria-label="Colour theme">
              <button type="button" data-theme="battery" aria-pressed="false"
                class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold text-app-muted transition duration-200 hover:text-app-accent focus:outline-none focus:ring-2 focus:ring-app-accent aria-pressed:bg-app-surface aria-pressed:text-app-accent aria-pressed:shadow-sm sm:px-3 sm:text-xs">
                ${icon("sun", "h-3.5 w-3.5")}<span class="hidden sm:inline">Battery Saver</span><span class="sm:hidden">Saver</span>
              </button>
              <button type="button" data-theme="performance" aria-pressed="false"
                class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold text-app-muted transition duration-200 hover:text-app-accent focus:outline-none focus:ring-2 focus:ring-app-accent aria-pressed:bg-app-surface aria-pressed:text-app-accent aria-pressed:shadow-sm sm:px-3 sm:text-xs">
                ${icon("moon", "h-3.5 w-3.5")}<span class="hidden sm:inline">Performance</span><span class="sm:hidden">Perf</span>
              </button>
            </div>
            <button id="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="Toggle navigation"
              class="btn-ghost px-3 py-2 md:hidden">
              ${icon("menu", "h-4 w-4")}<span>Menu</span>
            </button>
          </div>
        </div>
        <nav id="main-nav" aria-label="Main navigation"
          class="mt-3 hidden flex-col gap-1 rounded-xl border border-app-border bg-app-surface p-2 shadow-lg md:mt-2 md:flex md:flex-row md:border-0 md:bg-transparent md:p-0 md:shadow-none">
          ${links}
        </nav>
      </div>
    </header>`;
}

function footerHtml() {
  return `
    <footer class="mt-14 border-t border-app-border bg-app-surface/70">
      <div class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-7 text-xs text-app-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p class="flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-app-accent"></span>Student Laptop Finder &middot; SW302 User Interface Development</p>
        <p>Built with JavaScript ES modules and Tailwind CSS 4 &middot; GitHub repo link in README.md</p>
      </div>
    </footer>`;
}

// Switching a single class on <html> updates every themed Tailwind utility.
// aria-pressed drives the active look of both switch buttons in CSS.
export function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle("theme-battery", theme === "battery");
  root.classList.toggle("theme-performance", theme === "performance");

  document.querySelectorAll("[data-theme]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.theme === theme));
  });
}

function setupEvents() {
  if (eventsReady) return;
  eventsReady = true;

  document.addEventListener("click", (event) => {
    const themeButton = event.target.closest("[data-theme]");
    if (themeButton) {
      const theme = themeButton.dataset.theme;
      saveTheme(theme);
      applyTheme(theme);
      return;
    }

    const favButton = event.target.closest("[data-fav-id]");
    if (favButton) {
      const id = Number(favButton.dataset.favId);
      toggleFavorite(id);
      syncFavoriteButtons(id);
      document.dispatchEvent(new CustomEvent("favorites-changed", { detail: { id } }));
    }
  });

  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-nav");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.contains("hidden");
      nav.classList.toggle("hidden", !open);
      nav.classList.toggle("flex", open);
      menuToggle.setAttribute("aria-expanded", String(open));
    });
  }
}

export function renderShell(activePage) {
  const header = document.getElementById("site-header");
  // Soft colour blobs sit behind the content and follow the active theme.
  header.innerHTML = `
    <div aria-hidden="true" class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div class="absolute -left-32 -top-40 h-96 w-96 rounded-full bg-app-accent/10 blur-3xl"></div>
      <div class="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-app-accent/10 blur-3xl"></div>
    </div>
    ${headerHtml(activePage)}`;
  document.getElementById("site-footer").innerHTML = footerHtml();
  applyTheme(getTheme());
  setupEvents();
}

function specChip(iconName, label, value) {
  return `
    <div class="flex items-center gap-2 rounded-xl bg-app-surface-2/80 px-2.5 py-2">
      <span class="text-app-accent">${icon(iconName, "h-4 w-4")}</span>
      <span class="min-w-0">
        <dt class="text-[10px] font-extrabold uppercase tracking-wide text-app-muted">${label}</dt>
        <dd class="truncate text-xs font-bold text-app-text">${value}</dd>
      </span>
    </div>`;
}

// The same renderer is used on the catalogue, favorites and home pages.
export const laptopCard = (laptop) => {
  const saved = isFavorite(laptop.id);

  return `
    <article class="laptop-card group">
      <a href="details.html?id=${laptop.id}" class="relative block overflow-hidden rounded-xl bg-app-surface-2" aria-label="View details for ${laptop.name}">
        <img src="${laptop.image}" alt="${laptop.name}" loading="lazy"
          class="h-44 w-full object-cover transition duration-500 group-hover:scale-105" />
        <span class="badge badge-glass absolute left-3 top-3">${laptop.category}</span>
        <span class="absolute bottom-3 right-3 rounded-lg bg-app-surface/90 px-2.5 py-1 text-sm font-black text-app-accent shadow-sm backdrop-blur">${formatPrice(laptop.price)}</span>
      </a>
      <div class="mt-4 flex flex-1 flex-col">
        <p class="text-[11px] font-extrabold uppercase tracking-widest text-app-accent">${laptop.brand}</p>
        <h3 class="mt-1 text-base font-bold leading-snug text-app-text">${laptop.name}</h3>
        <dl class="mt-4 space-y-2">
          ${specChip("cpu", "Processor", laptop.cpu)}
          <div class="grid grid-cols-2 gap-2">
            ${specChip("ram", "RAM", `${laptop.ramGB} GB`)}
            ${specChip("storage", "Storage", `${laptop.storageGB} GB`)}
            ${specChip("battery", "Battery", `${laptop.batteryHours} h`)}
            ${specChip("weight", "Weight", `${laptop.weightKg} kg`)}
          </div>
        </dl>
        <div class="mt-auto flex gap-2 pt-5">
          <a href="details.html?id=${laptop.id}" class="btn-action flex-1">View details ${icon("arrow", "h-4 w-4")}</a>
          <button type="button" data-fav-id="${laptop.id}" aria-pressed="${saved}"
            class="btn-ghost px-3" aria-label="${saved ? "Remove" : "Save"} ${laptop.name} ${saved ? "from" : "to"} favorites">
            ${icon("heart", `h-4 w-4 ${saved ? "fill-current" : ""}`)}
            <span data-heart>${saved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>
    </article>`;
};

export function syncFavoriteButtons(id) {
  const saved = isFavorite(id);
  document.querySelectorAll(`[data-fav-id="${id}"]`).forEach((button) => {
    button.setAttribute("aria-pressed", String(saved));
    const label = button.querySelector("[data-heart]");
    if (label) label.textContent = saved ? "Saved" : "Save";
    const heart = button.querySelector("svg");
    if (heart) heart.classList.toggle("fill-current", saved);
  });
}

export const statCard = (iconName, label, value, hint = "", valueClass = "text-2xl") => `
  <div class="stat-card">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="section-label">${label}</p>
        <p class="mt-1 break-words font-black tracking-tight text-app-accent ${valueClass}">${value}</p>
      </div>
      <span class="icon-chip">${icon(iconName, "h-5 w-5")}</span>
    </div>
    ${hint ? `<p class="mt-2 text-xs text-app-muted">${hint}</p>` : ""}
  </div>`;

export function renderSkeleton(container, count = 6) {
  container.innerHTML = Array.from({ length: count }, () => `
    <div class="panel animate-pulse">
      <div class="h-44 w-full rounded-xl bg-app-surface-2"></div>
      <div class="mt-4 h-3 w-1/4 rounded bg-app-surface-2"></div>
      <div class="mt-2 h-5 w-3/4 rounded bg-app-surface-2"></div>
      <div class="mt-4 h-14 rounded-xl bg-app-surface-2"></div>
      <div class="mt-2 grid grid-cols-2 gap-2">
        <div class="h-10 rounded-xl bg-app-surface-2"></div>
        <div class="h-10 rounded-xl bg-app-surface-2"></div>
        <div class="h-10 rounded-xl bg-app-surface-2"></div>
        <div class="h-10 rounded-xl bg-app-surface-2"></div>
      </div>
      <div class="mt-5 h-10 rounded-xl bg-app-surface-2"></div>
    </div>`).join("");
}

export function showError(container, error) {
  container.innerHTML = `
    <div class="empty-state">
      <span class="icon-chip h-12 w-12">${icon("alert", "h-6 w-6")}</span>
      <h2 class="mt-4 text-lg font-bold">Could not load laptop data</h2>
      <p class="mt-2 max-w-md text-sm text-app-muted">${error.message}</p>
      <p class="mt-1 max-w-md text-sm text-app-muted">Open this project through a local server (for example VS Code Live Server), because fetch() cannot read files directly.</p>
    </div>`;
}
