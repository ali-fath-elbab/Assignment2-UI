// compare.js - builds the comparison table and calculates the best value per row.

import { formatPrice, icon } from "./ui.js";

// "best" tells us whether a smaller or a larger number wins in that row.
export const comparisonRows = [
  { key: "price", label: "Price", best: "min", format: formatPrice },
  { key: "brand", label: "Brand", best: null },
  { key: "cpu", label: "Processor", best: null },
  { key: "category", label: "Category", best: null },
  { key: "ramGB", label: "RAM", best: "max", format: (value) => `${value} GB` },
  { key: "storageGB", label: "Storage", best: "max", format: (value) => `${value} GB` },
  { key: "batteryHours", label: "Battery life", best: "max", format: (value) => `${value} h` },
  { key: "weightKg", label: "Weight", best: "min", format: (value) => `${value} kg` },
  { key: "screenInches", label: "Screen", best: null, format: (value) => `${value} in` },
];

export function findBest(laptops, key, direction) {
  if (!direction || laptops.length === 0) return null;
  const values = laptops.map((laptop) => laptop[key]);
  return direction === "min" ? Math.min(...values) : Math.max(...values); // if direction is "min", return the smallest value; if "max", return the largest value.
}

export function renderComparison(laptops) {
  const headers = laptops  //headers are the laptop cards at the top of the comparison table
    .map((laptop, index) => `
      <th scope="col" class="min-w-[190px] border-l border-app-border p-3 align-top text-left">
        <div class="relative mb-2 overflow-hidden rounded-lg bg-app-surface-2">
          <img src="${laptop.image}" alt="" class="h-20 w-full object-cover" />
          <span class="absolute left-2 top-2 rounded-md bg-app-surface/90 px-2 py-0.5 text-[10px] font-black text-app-accent shadow-sm">#${index + 1}</span>
        </div>
        <p class="text-[10px] font-extrabold uppercase tracking-widest text-app-muted">${laptop.brand}</p>
        <p class="text-sm font-black leading-snug text-app-text">${laptop.name}</p>
      </th>`)
    .join("");

  const rows = comparisonRows 
    .map((row) => { 
      const best = findBest(laptops, row.key, row.best);
      const cells = laptops
        .map((laptop) => {  // shows the value for each laptop in that row, and highlights the best value if applicable
          const value = laptop[row.key];
          const isBest = row.best !== null && value === best;
          return `<td class="border-t border-app-border p-3 text-sm ${isBest ? "bg-app-best font-black text-app-best-text" : "text-app-text"}">
            <span class="inline-flex items-center gap-1.5">${row.format ? row.format(value) : value}
            ${isBest ? `<span class="inline-flex items-center gap-0.5 rounded-full bg-app-surface/70 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-app-best-text">${icon("sparkles", "h-3 w-3")}best</span>` : ""}</span>
          </td>`;
        })
        .join("");

      return `<tr class="odd:bg-app-surface-2/40"><th scope="row" class="p-3 text-left text-xs font-extrabold uppercase tracking-wide text-app-muted">${row.label}</th>${cells}</tr>`;
    })
    .join("");

  return `
    <div class="overflow-x-auto rounded-2xl border border-app-border bg-app-surface shadow-sm">
      <table class="w-full min-w-[720px] border-collapse text-left">
        <thead class="bg-app-surface-2/80">
          <tr><th scope="col" class="p-3 text-xs font-extrabold uppercase tracking-widest text-app-muted">Specification</th>${headers}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}
