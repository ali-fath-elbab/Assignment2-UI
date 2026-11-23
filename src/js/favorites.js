// favorites.js - saved laptops with totals, removal and clear-all.

import { loadLaptops } from "./api.js";
import { getFavorites, removeFavorite, clearFavorites } from "./storage.js";
import {
  renderShell,
  laptopCard,
  renderSkeleton,
  showError,
  formatPrice,
  statCard,
  icon,
} from "./ui.js";

renderShell("favorites");

const list = document.getElementById("favorites-list");
const summary = document.getElementById("favorites-summary");
const clearButton = document.getElementById("clear-favorites");
let laptops = [];

function render() {
  const ids = getFavorites();
  // Keep the order in which the student saved the laptops.
  const saved = ids
    .map((id) => laptops.find((laptop) => laptop.id === id))
    .filter(Boolean);

  if (saved.length === 0) {
    summary.innerHTML = [
      statCard("heart", "Saved laptops", 0),
      statCard("tag", "Total value", formatPrice(0)),
      statCard("chart", "Average price", formatPrice(0)),
    ].join("");
    list.innerHTML = `
      <div class="empty-state">
        <span class="icon-chip h-12 w-12">${icon("heart", "h-6 w-6")}</span>
        <h2 class="mt-4 text-lg font-bold">No favorites yet</h2>
        <p class="mt-2 max-w-md text-sm text-app-muted">Use the Save button on any laptop card or detail page, then come back here.</p>
        <a href="laptops.html" class="btn-action mt-5">Open the catalogue</a>
      </div>`;
    return;
  }

  // reduce() gives both the total value and the average price.
  const total = saved.reduce((sum, laptop) => sum + laptop.price, 0);
  const average = total / saved.length;

  summary.innerHTML = [
    statCard("heart", "Saved laptops", saved.length, "Across all saved devices"),
    statCard("tag", "Total value", formatPrice(total), "Sum of saved prices"),
    statCard("chart", "Average price", formatPrice(Math.round(average)), "Mean saved price"),
  ].join("");

  list.innerHTML = saved
    .map(
      (laptop) => `
        <div class="flex flex-col">
          ${laptopCard(laptop)}
          <button type="button" data-remove-id="${laptop.id}"
            class="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-app-border bg-app-surface px-4 py-2 text-xs font-bold text-app-muted transition duration-200 hover:border-app-accent hover:text-app-accent focus:outline-none focus:ring-2 focus:ring-app-accent">
            ${icon("heart", "h-4 w-4")}Remove from favorites
          </button>
        </div>`
    )
    .join("");
}

list.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove-id]");
  if (!button) return;
  removeFavorite(Number(button.dataset.removeId));
  render();
});

clearButton.addEventListener("click", () => {
  clearFavorites();
  render();
});

document.addEventListener("favorites-changed", () => {
  if (laptops.length) render();
});

async function init() {
  renderSkeleton(list, 3);
  try {
    laptops = await loadLaptops();
    render();
  } catch (error) {
    showError(list, error);
  }
}

init();
