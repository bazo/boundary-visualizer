import { CountriesSchema } from "./types";
import type { LngLatBounds } from "mapbox-gl";

export async function fetchCountries(
	bounds: LngLatBounds | null | undefined,
	mainLandOnly = false,
	signal?: AbortSignal
) {
	const res = await fetch(
		`http://localhost:8000/?mainLandOnly=${mainLandOnly}&bbox=${bounds ? bounds.toArray().flat().join(",") : ""}`,
		{
			signal
		}
	);
	const json = await res.json();
	return CountriesSchema.parse(json);
}
