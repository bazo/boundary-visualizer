import { CountriesSchema } from "./types";
import type { LngLatBounds } from "mapbox-gl";

export async function fetchCountries(bounds: LngLatBounds | null | undefined) {
	const res = await fetch(`http://localhost:8000/?bbox=${bounds ? bounds.toArray().flat().join(",") : ""}`);
	const json = await res.json();
	return CountriesSchema.parse(json);
}
