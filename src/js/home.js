// home.js - introduction, live statistics and a few featured laptops.

import { loadLaptops } from "./api.js";
import { getFavorites } from "./storage.js";
import {
  renderShell,
  laptopCard,
  renderSkeleton,
  showError,
  formatPrice,
  statCard,
  icon,
} from "./ui.js";

renderShell("home");

const statsGrid = document.getElementById("stats-grid");
const featureGrid = document.getElementById("feature-grid");
const featuredGrid = document.getElementById("featured-grid");
let allLaptops = [];

const features = [
  { href: "laptops.html", title: "Catalogue", text: "Search, filter and sort the full list.", iconName: "search" },
  { href: "details.html?id=7", title: "Details", text: "Read the full specification table.", iconName: "laptop" },
  { href: "favorites.html", title: "Favorites", text: "Keep the laptops you like saved.", iconName: "heart" },
  { href: "compare.html", title: "Compare", text: "See up to four favorites side by side.", iconName: "chart" },
];

featureGrid.innerHTML = features
  .map(
    (feature) => `
      <a href="${feature.href}"
        class="panel group transition duration-200 hover:-translate-y-1 hover:border-app-accent hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-app-accent">
        <span class="icon-chip transition duration-200 group-hover:bg-app-accent group-hover:text-app-on-accent">${icon(feature.iconName, "h-5 w-5")}</span>
        <p class="mt-4 text-lg font-black">${feature.title}</p>
        <p class="mt-1 text-sm text-app-muted">${feature.text}</p>
        <span class="mt-3 inline-flex items-center gap-1 text-xs font-bold text-app-accent">Open page ${icon("arrow", "h-3.5 w-3.5")}</span>
      </a>`
  )
  .join("");

function renderStats(laptops) {
  // reduce() calculates the cheapest and the average price from the data.
  const cheapest = laptops.reduce((min, laptop) => Math.min(min, laptop.price), Infinity);
  const average = laptops.reduce((sum, laptop) => sum + laptop.price, 0) / laptops.length;
  const categories = new Set(laptops.map((laptop) => laptop.category)).size;

  document.getElementById("hero-laptops").textContent = `${laptops.length} laptops`;
  document.getElementById("hero-categories").textContent = `${categories} categories`;

  statsGrid.innerHTML = [
    statCard("laptop", "Laptops available", laptops.length, `${categories} categories to explore`),
    statCard("tag", "Lowest price", formatPrice(cheapest), "Best value in the catalogue"),
    statCard("chart", "Average price", formatPrice(Math.round(average)), "Across every laptop"),
    statCard("heart", "Saved favorites", getFavorites().length, "Synced across all pages"),
  ].join("");
}

async function init() {
  renderSkeleton(featuredGrid, 3);

  try {
    allLaptops = await loadLaptops();
    renderStats(allLaptops);
    featuredGrid.innerHTML = allLaptops.slice(0, 3).map(laptopCard).join("");
  } catch (error) {
    showError(featuredGrid, error);
  }
}

document.addEventListener("favorites-changed", () => {
  if (allLaptops.length) renderStats(allLaptops);
});

init();
