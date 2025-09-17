import { CountriesSchema } from "./types";
import type { LngLatBounds } from "mapbox-gl";

export async function fetchCountries(
	bounds: LngLatBounds | null | undefined,
	mainLandOnly = false,
	signal?: AbortSignal,
) {
	const res = await fetch(
		`${import.meta.env.VITE_API_URL ?? ""}/boundaries?mainLandOnly=${mainLandOnly}&bbox=${bounds ? bounds.toArray().flat().join(",") : ""}`,
		{
			signal,
		},
	);
	const json = await res.json();
	return CountriesSchema.parse(json);
}
