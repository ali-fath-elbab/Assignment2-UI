// comparePage.js - choose two to four favorites and compare them side by side.

import { loadLaptops } from "./api.js";
import { getFavorites, getCompareIds, saveCompareIds, toggleCompare } from "./storage.js";
import { renderShell, renderSkeleton, showError, formatPrice, icon } from "./ui.js";
import { renderComparison } from "./compare.js";

renderShell("compare");

const picker = document.getElementById("compare-picker");
const tableArea = document.getElementById("compare-table");
const message = document.getElementById("compare-message");
const countLabel = document.getElementById("compare-count");
let laptops = [];
let favorites = [];

function renderPicker(selectedIds) {
  if (favorites.length === 0) {
    picker.innerHTML = `
      <div class="empty-state sm:col-span-2 lg:col-span-4">
        <span class="icon-chip h-12 w-12">${icon("heart", "h-6 w-6")}</span>
        <p class="mt-4 text-sm font-bold">Save some laptops first, then they will appear here.</p>
        <a href="favorites.html" class="btn-ghost mt-4">See your favorites</a>
      </div>`;
    return;
  }

  picker.innerHTML = favorites
    .map(
      (laptop) => `
        <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-app-border bg-app-surface p-3 transition duration-200 hover:border-app-accent hover:shadow-sm focus-within:ring-2 focus-within:ring-app-accent has-checked:border-app-accent has-checked:bg-app-accent-soft has-checked:shadow-sm">
          <input type="checkbox" data-compare-id="${laptop.id}"
            ${selectedIds.includes(laptop.id) ? "checked" : ""}
            class="h-4 w-4 shrink-0 rounded border-app-border text-app-accent focus:ring-app-accent" />
          <img src="${laptop.image}" alt="" class="h-11 w-16 shrink-0 rounded-lg object-cover" />
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-bold text-app-text">${laptop.name}</span>
            <span class="block text-xs font-semibold text-app-accent">${formatPrice(laptop.price)}</span>
          </span>
        </label>`
    )
    .join("");
}

function render() {
  // Only favorites can be compared, so ignore any stale ids in storage.
  const ids = getCompareIds().filter((id) => favorites.some((laptop) => laptop.id === id));
  const selected = ids
    .map((id) => laptops.find((laptop) => laptop.id === id))
    .filter(Boolean);

  countLabel.textContent = `${selected.length} of 4 selected`;
  renderPicker(ids);

  if (favorites.length < 2) {
    tableArea.innerHTML = `
      <div class="empty-state">
        <span class="icon-chip h-12 w-12">${icon("chart", "h-6 w-6")}</span>
        <h2 class="mt-4 text-lg font-bold">Pick at least two favorites</h2>
        <p class="mt-2 max-w-md text-sm text-app-muted">Save more laptops, then tick two to four of them above to see them side by side.</p>
      </div>`;
    return;
  }

  if (selected.length < 2) {
    tableArea.innerHTML = `
      <div class="empty-state">
        <span class="icon-chip h-12 w-12">${icon("check", "h-6 w-6")}</span>
        <h2 class="mt-4 text-lg font-bold">Select at least two laptops</h2>
        <p class="mt-2 max-w-md text-sm text-app-muted">Tick another checkbox above to start comparing.</p>
      </div>`;
    return;
  }

  tableArea.innerHTML = renderComparison(selected);
}

picker.addEventListener("change", (event) => {
  const box = event.target.closest("[data-compare-id]");
  if (!box) return;

  const result = toggleCompare(Number(box.dataset.compareId));
  if (result.blocked) {
    box.checked = false;
    message.textContent = "You can compare up to 4 laptops. Untick one before choosing another.";
    return;
  }

  message.textContent = "";
  render();
});

document.addEventListener("favorites-changed", () => {
  if (!laptops.length) return;
  const favoriteIds = getFavorites();
  favorites = favoriteIds
    .map((id) => laptops.find((laptop) => laptop.id === id))
    .filter(Boolean);
  saveCompareIds(getCompareIds().filter((id) => favoriteIds.includes(id)));
  render();
});

async function init() {
  renderSkeleton(picker, 3);
  tableArea.innerHTML = `<div class="panel animate-pulse"><div class="h-64 rounded-xl bg-app-surface-2"></div></div>`;

  try {
    laptops = await loadLaptops();
    const favoriteIds = getFavorites();
    favorites = favoriteIds
      .map((id) => laptops.find((laptop) => laptop.id === id))
      .filter(Boolean);
    saveCompareIds(getCompareIds().filter((id) => favoriteIds.includes(id)));
    render();
  } catch (error) {
    showError(tableArea, error);
  }
}

init();
