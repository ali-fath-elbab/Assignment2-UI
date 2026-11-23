// api.js - the only place that talks to the JSON file.

const DATA_URL = "data/laptops.json";

export async function loadLaptops() {
  const response = await fetch(DATA_URL);

  if (!response.ok) {
    throw new Error(`Could not load laptops (HTTP ${response.status}).`);
  }

  return await response.json();
}
