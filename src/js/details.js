// details.js - shows one laptop chosen by its id in the address bar.

import { loadLaptops } from "./api.js";
import { isFavorite, getCompareIds, toggleCompare } from "./storage.js";
import {
  renderShell,
  renderSkeleton,
  showError,
  formatPrice,
  syncFavoriteButtons,
  statCard,
  icon,
} from "./ui.js";

renderShell("details");

const content = document.getElementById("details-content");
const id = Number(new URLSearchParams(window.location.search).get("id"));

const specLabels = {
  id: "Product ID",
  name: "Name",
  brand: "Brand",
  price: "Price",
  category: "Category",
  cpu: "Processor",
  ramGB: "RAM (GB)",
  storageGB: "Storage (GB)",
  batteryHours: "Battery life (hours)",
  weightKg: "Weight (kg)",
  screenInches: "Screen size (inches)",
};

function renderSpecs(laptop) {
  return Object.entries(specLabels)
    .map(([key, label]) => {
      const value = key === "price" ? formatPrice(laptop.price) : laptop[key];
      return `<tr class="border-t border-app-border odd:bg-app-surface-2/40">
        <th scope="row" class="w-1/2 p-3 text-left text-xs font-extrabold uppercase tracking-wide text-app-muted">${label}</th>
        <td class="p-3 text-sm font-bold text-app-text">${value}</td>
      </tr>`;
    })
    .join("");
}

function syncCompareButton() {
  const button = document.getElementById("compare-button");
  const label = document.getElementById("compare-label");
  const message = document.getElementById("compare-message");
  if (!button) return;

  const selected = getCompareIds().includes(id);
  button.setAttribute("aria-pressed", String(selected));
  label.textContent = selected ? "In comparison" : "Add to compare";
  message.textContent = selected ? "This laptop is ready to compare." : "";
  const check = button.querySelector("svg");
  if (check) check.classList.toggle("fill-current", selected);
}

function renderLaptop(laptop) {
  const saved = isFavorite(laptop.id);

  content.innerHTML = `
    <div class="grid gap-8 lg:grid-cols-2">
      <div>
        <div class="relative rounded-2xl border border-app-border bg-app-surface p-3 shadow-lg shadow-app-accent/10">
          <span class="badge badge-glass absolute left-6 top-6">${laptop.category}</span>
          <img src="${laptop.image}" alt="${laptop.name}" class="w-full rounded-xl bg-app-surface-2 object-cover" />
        </div>
        <div class="panel mt-5">
          <h2 class="flex items-center gap-2 text-base font-black"><span class="icon-chip h-8 w-8">${icon("sparkles", "h-4 w-4")}</span>About this laptop</h2>
          <p class="mt-3 text-sm leading-7 text-app-muted">${laptop.description}</p>
        </div>
      </div>
      <div>
        <p class="section-label">${laptop.brand}</p>
        <h1 class="text-3xl font-black tracking-tight sm:text-4xl">${laptop.name}</h1>
        <p class="mt-4 inline-flex items-center gap-2 rounded-xl bg-app-accent-soft px-4 py-2 text-3xl font-black text-app-accent">
          ${icon("tag", "h-6 w-6")}${formatPrice(laptop.price)}
        </p>

        <div class="mt-5 flex flex-wrap gap-3">
          <button type="button" data-fav-id="${laptop.id}" aria-pressed="${saved}" class="btn-action">
            ${icon("heart", `h-4 w-4 ${saved ? "fill-current" : ""}`)}<span data-heart>${saved ? "Saved" : "Save to favorites"}</span>
          </button>
          <button type="button" id="compare-button" aria-pressed="false" class="btn-ghost">
            ${icon("check", "h-4 w-4")}<span id="compare-label">Add to compare</span>
          </button>
        </div>
        <p id="compare-message" class="mt-2 text-sm font-bold text-app-accent" role="status"></p>

        <div class="mt-7">
          <h2 class="section-label">At a glance</h2>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            ${statCard("ram", "RAM", `${laptop.ramGB} GB`)}
            ${statCard("storage", "Storage", `${laptop.storageGB} GB`)}
            ${statCard("battery", "Battery", `${laptop.batteryHours} h`)}
            ${statCard("weight", "Weight", `${laptop.weightKg} kg`)}
            ${statCard("screen", "Screen", `${laptop.screenInches} in`)}
            ${statCard("cpu", "Processor", laptop.cpu, "", "text-sm leading-snug")}
          </div>
        </div>

        <div class="panel mt-7 overflow-hidden p-0">
          <div class="border-b border-app-border bg-app-surface-2/60 px-5 py-3">
            <h2 class="flex items-center gap-2 text-sm font-black uppercase tracking-wide"><span class="icon-chip h-7 w-7">${icon("sliders", "h-3.5 w-3.5")}</span>Full specifications</h2>
          </div>
          <table class="w-full border-collapse">
            <caption class="sr-only">Full specifications for ${laptop.name}</caption>
            <tbody>${renderSpecs(laptop)}</tbody>
          </table>
        </div>
      </div>
    </div>`;

  syncFavoriteButtons(laptop.id);
  syncCompareButton();

  document.getElementById("compare-button").addEventListener("click", () => {
    const result = toggleCompare(laptop.id);
    const message = document.getElementById("compare-message");
    if (result.blocked) {
      message.textContent = "You can compare up to 4 laptops. Remove one on the Compare page first.";
      return;
    }
    syncCompareButton();
  });
}

function showMissing(message) {
  content.innerHTML = `
    <div class="empty-state mx-auto max-w-xl">
      <span class="icon-chip h-12 w-12">${icon("alert", "h-6 w-6")}</span>
      <h1 class="mt-4 text-2xl font-black">Laptop not found</h1>
      <p class="mt-2 max-w-md text-sm text-app-muted">${message}</p>
      <a href="laptops.html" class="btn-action mt-5">Browse the catalogue</a>
    </div>`;
}

document.addEventListener("favorites-changed", () => {
  if (!Number.isNaN(id)) syncFavoriteButtons(id);
});

async function init() {
  if (Number.isNaN(id) || id <= 0) {
    showMissing("This page needs a valid id in the URL, for example details.html?id=7.");
    return;
  }

  renderSkeleton(content, 1);

  try {
    const laptops = await loadLaptops();
    const laptop = laptops.find((item) => item.id === id);
    if (!laptop) {
      showMissing(`There is no laptop with id ${id}.`);
      return;
    }
    renderLaptop(laptop);
  } catch (error) {
    showError(content, error);
  }
}

init();
