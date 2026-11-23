// storage.js - all localStorage access for favourites, comparison and theme.

const FAVORITES_KEY = "laptopFinder.favorites";
const COMPARE_KEY = "laptopFinder.compare";
const THEME_KEY = "laptopFinder.theme";

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

export const getFavorites = () => readList(FAVORITES_KEY);

export const saveFavorites = (ids) => writeList(FAVORITES_KEY, ids);

export const isFavorite = (id) => getFavorites().includes(id);

export function toggleFavorite(id) {
  const ids = getFavorites();
  const next = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
  saveFavorites(next);
  return next.includes(id);
}

export const removeFavorite = (id) =>
  saveFavorites(getFavorites().filter((item) => item !== id));

export const clearFavorites = () => saveFavorites([]);

export const getCompareIds = () => readList(COMPARE_KEY).slice(0, 4);

export const saveCompareIds = (ids) => writeList(COMPARE_KEY, ids.slice(0, 4));

// Returns "blocked" when a fifth laptop is chosen so the page can show a message.
export function toggleCompare(id) {
  const ids = getCompareIds();

  if (ids.includes(id)) {
    const next = ids.filter((item) => item !== id);
    saveCompareIds(next);
    return { ids: next, blocked: false };
  }

  if (ids.length >= 4) {
    return { ids, blocked: true };
  }

  const next = [...ids, id];
  saveCompareIds(next);
  return { ids: next, blocked: false };
}

export function getTheme() {
  try {
    const value = JSON.parse(localStorage.getItem(THEME_KEY));
    return value === "performance" ? "performance" : "battery";
  } catch {
    return "battery";
  }
}

export const saveTheme = (theme) =>
  localStorage.setItem(THEME_KEY, JSON.stringify(theme));
