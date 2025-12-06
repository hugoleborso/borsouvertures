import openingsData from "@/openings/openings.json";
import type { Opening } from "./types";

const OPENINGS_URL = "/openings.json";

export async function loadOpenings(): Promise<Opening[]> {
  try {
    const response = await fetch(OPENINGS_URL, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Failed to fetch openings.json (${response.status})`);
    }
    const data = (await response.json()) as Opening[];
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("openings.json returned empty data");
    }
    return data;
  } catch (err) {
    console.warn("Falling back to bundled openings.json", err);
    // Bundled import as fallback for offline/serve scenarios
    return openingsData as Opening[];
  }
}
