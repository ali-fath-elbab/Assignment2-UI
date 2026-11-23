// laptops.js - catalogue with search, filters, sorting and skeleton loading.

import { loadLaptops } from "./api.js";
import { renderShell, laptopCard, renderSkeleton, showError, icon } from "./ui.js";

renderShell("laptops");

const grid = document.getElementById("laptop-grid");
const resultCount = document.getElementById("result-count");
const searchInput = document.getElementById("search");
const categorySelect = document.getElementById("category");
const maxPriceInput = document.getElementById("max-price");
const minRamSelect = document.getElementById("min-ram");
const minBatterySelect = document.getElementById("min-battery");
const sortSelect = document.getElementById("sort");
const sortDirButton = document.getElementById("sort-dir");
const sortDirLabel = document.getElementById("sort-dir-label");
const resetButton = document.getElementById("reset-filters");

let laptops = [];

const filters = {
  search: "",
  category: "all",
  maxPrice: 0,
  minRam: 0,
  minBattery: 0,
  sort: "price",
  direction: "asc",
};

function update() {
  const term = filters.search.trim().toLowerCase();

  // filter() applies every control together; sort() works on a copy.
  const matches = laptops.filter(
    (laptop) =>
      (laptop.name.toLowerCase().includes(term) ||
        laptop.brand.toLowerCase().includes(term)) &&
      (filters.category === "all" || laptop.category === filters.category) &&
      (filters.maxPrice === 0 || laptop.price <= filters.maxPrice) &&
      laptop.ramGB >= filters.minRam &&
      laptop.batteryHours >= filters.minBattery
  );

  const sorted = [...matches].sort((a, b) => {
    const difference = a[filters.sort] - b[filters.sort];
    return filters.direction === "asc" ? difference : -difference;
  });

  resultCount.textContent = `${sorted.length} of ${laptops.length} laptops`;
  sortDirLabel.textContent =
    filters.direction === "asc" ? "Low to high" : "High to low";

  if (sorted.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <span class="icon-chip h-12 w-12">${icon("search", "h-6 w-6")}</span>
        <h2 class="mt-4 text-lg font-bold">No laptops match those filters</h2>
        <p class="mt-2 max-w-md text-sm text-app-muted">Try a different brand, raise the maximum price or lower the minimum requirements.</p>
        <button type="button" id="empty-reset" class="btn-ghost mt-5">Reset filters</button>
      </div>`;
    document.getElementById("empty-reset").addEventListener("click", resetControls);
    return;
  }

  grid.innerHTML = sorted.map(laptopCard).join("");
}

function readControls() {
  filters.search = searchInput.value;
  filters.category = categorySelect.value;
  filters.maxPrice = Number(maxPriceInput.value) || 0;
  filters.minRam = Number(minRamSelect.value);
  filters.minBattery = Number(minBatterySelect.value);
  filters.sort = sortSelect.value;
  update();
}

function resetControls() {
  searchInput.value = "";
  categorySelect.value = "all";
  maxPriceInput.value = "";
  minRamSelect.value = "0";
  minBatterySelect.value = "0";
  sortSelect.value = "price";
  filters.direction = "asc";
  readControls();
}

[searchInput, categorySelect, maxPriceInput, minRamSelect, minBatterySelect, sortSelect].forEach(
  (control) => control.addEventListener("input", readControls)
);

sortDirButton.addEventListener("click", () => {
  filters.direction = filters.direction === "asc" ? "desc" : "asc";
  update();
});

resetButton.addEventListener("click", resetControls);

// Cards are re-rendered here, so keep their favorite state in sync with storage.
document.addEventListener("favorites-changed", () => {
  if (laptops.length) update();
});

async function init() {
  renderSkeleton(grid, 6);

  try {
    laptops = await loadLaptops();
    update();
  } catch (error) {
    showError(grid, error);
    resultCount.textContent = "0 laptops";
  }
}

init();
