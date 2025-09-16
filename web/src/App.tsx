import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl, {
	type LngLatBounds,
	//type GeoJSONSourceSpecification,
} from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { fetchCountries } from "./query";
import type { Countries } from "./types";
import type geojson from "geojson";
import { colorForCountry, previewColor } from "./utils";
import { Loader } from "./loader";

function addSources(map: mapboxgl.Map, data: Countries) {
	let i = 0;

	for (const countryName in data) {
		const boundaries = data[countryName];

		const fillColor = colorForCountry(countryName, i);

		previewColor(fillColor, countryName);

		for (const boundary of boundaries) {
			const id = boundary.id;
			const points = boundary.p;
			const sourceName = `${countryName}-${id}`;

			if (map.getSource(sourceName) !== undefined) {
				continue;
			}

			map.addSource(sourceName, {
				type: "geojson",
				data: {
					type: "Feature",
					geometry: {
						type: "Polygon",
						coordinates: [points.map((p) => p as geojson.Position)],
					},
					properties: {
						countryName,
						id,
					},
				},
			});

			map.addLayer({
				id: `${sourceName}-fill`,
				type: "fill",
				source: sourceName,
				paint: {
					"fill-color": fillColor,
					"fill-opacity": 0.5,
				},
			});

			map.addLayer({
				id: `${sourceName}-labels`,
				type: "symbol",
				source: sourceName,
				layout: {
					"text-field": ["get", "id"],
					"text-size": 20,
					"text-anchor": "center",
				},
				paint: {
					"text-color": "#111",
					"text-halo-color": "#fff",
					"text-halo-width": 1,
				},
			});

			// map.addLayer({
			// 	id: `${sourceName}-outline`,
			// 	type: "line",
			// 	source: sourceName,
			// 	paint: {
			// 		"line-color": fillColor,
			// 		"line-width": 1,
			// 		"line-opacity": 0.8,
			// 	},
			// });
		}
		i++;
	}
}

function App() {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const [isMapLoaded, setIsMapLoaded] = useState(false);
	const [loading, setLoading] = useState(true);

	const fetchCountriesAndApplySources = useCallback(
		(bounds: LngLatBounds | null | undefined) => {
			setLoading(true);
			fetchCountries(bounds).then((data) => {
				if (mapRef.current) {
					addSources(mapRef.current, data);
					setLoading(false);
				}
			});
		},
		[],
	);

	useEffect(() => {
		if (!isMapLoaded) {
			return;
		}

		const bounds = mapRef.current?.getBounds();
		fetchCountriesAndApplySources(bounds);
	}, [isMapLoaded, fetchCountriesAndApplySources]);

	useEffect(() => {
		mapboxgl.accessToken =
			"pk.eyJ1IjoiYmF6aWttIiwiYSI6ImNtZm1tdXNyZzAzZ2wyanM2NHd3N2h3MWoifQ.2INrb-fF7nz1M6-6h45GDg";

		mapRef.current = new mapboxgl.Map({
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			container: mapContainerRef.current!,
			//style: "mapbox://styles/mapbox/streets-v12",
			center: [17.1072, 48.1478],
			zoom: 5,
		});

		mapRef.current.on("load", () => {
			setIsMapLoaded(true);
		});

		mapRef.current.on("moveend", () => {
			const bounds = mapRef.current?.getBounds();
			fetchCountriesAndApplySources(bounds);
		});

		mapRef.current.on("zoomend", () => {
			const bounds = mapRef.current?.getBounds();
			fetchCountriesAndApplySources(bounds);
		});

		return () => mapRef.current?.remove();
	}, [fetchCountriesAndApplySources]);

	return (
		<div className="w-screen h-screen">
			{loading && <Loader />}
			<div ref={mapContainerRef} className="w-full h-full" />
		</div>
	);
}

export default App;
