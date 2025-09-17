import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { fetchCountries } from "./query";
import type { Countries } from "./types";
import type geojson from "geojson";
import { colorForCountry, previewColor } from "./utils";
import { Loader } from "./loader";
import { FloatingBox } from "./floating-box";
import { useQuery } from "@tanstack/react-query";

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

const defaultCenter: [number, number] = [17.1072, 48.1478];
const defaultZoom = 6;

function App() {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);
	const [isMapLoaded, setIsMapLoaded] = useState(false);
	const [loading, setLoading] = useState(true);

	const [showMainlandOnly, setShowMainlandOnly] = useState(() => {
		const saved = localStorage.getItem("show-mainland-only");
		return saved ? JSON.parse(saved) : false;
	});

	const onShowMainlandOnlyChange = (value: boolean) => {
		localStorage.setItem("show-mainland-only", JSON.stringify(value));

		const map = mapRef.current;

		// remove all layers
		const layers = map?.getStyle().layers?.slice().reverse();
		if (layers) {
			for (const layer of layers) {
				if (map?.getLayer(layer.id)) {
					map.removeLayer(layer.id);
				}
			}
		}

		// remove all sources
		if (map?.getStyle().sources) {
			for (const sourceId of Object.keys(map?.getStyle().sources)) {
				if (map?.getSource(sourceId)) {
					map.removeSource(sourceId);
				}
			}
		}
		setShowMainlandOnly(value);

		refetch();
	};

	const { data, isLoading, refetch } = useQuery({
		queryKey: ["countries", showMainlandOnly],
		queryFn: ({ signal }) => {
			return fetchCountries(
				mapRef.current?.getBounds(),
				showMainlandOnly,
				signal,
			);
		},
		enabled: isMapLoaded,
	});

	useEffect(() => {
		if (mapRef.current && data) {
			addSources(mapRef.current, data);
			setLoading(false);
		}
	}, [data]);

	useEffect(() => {
		const saved = localStorage.getItem("map-position");
		let initialCenter: [number, number] = defaultCenter;
		let initialZoom = defaultZoom;

		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				initialCenter = parsed.center || defaultCenter;
				initialZoom = parsed.zoom || defaultZoom;
			} catch {
				/* ignore */
			}
		}

		mapboxgl.accessToken =
			"pk.eyJ1IjoiYmF6aWttIiwiYSI6ImNtZm1tdXNyZzAzZ2wyanM2NHd3N2h3MWoifQ.2INrb-fF7nz1M6-6h45GDg";

		mapRef.current = new mapboxgl.Map({
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			container: mapContainerRef.current!,
			//style: "mapbox://styles/mapbox/streets-v12",
			//style: "mapbox://styles/bazikm/cmfn9pym500bx01s50bshb3ym",
			center: initialCenter,
			zoom: initialZoom,
			minZoom: 4.5,
			dragRotate: false,
		});

		mapRef.current.on("load", () => {
			setIsMapLoaded(true);
		});

		mapRef.current.on("moveend", () => {
			const center = mapRef.current?.getCenter();
			const zoom = mapRef.current?.getZoom();
			localStorage.setItem(
				"map-position",
				JSON.stringify({
					center: [
						center?.lng || defaultCenter[0],
						center?.lat || defaultCenter[1],
					],
					zoom: zoom || defaultZoom,
				}),
			);
			refetch();
		});

		mapRef.current.on("zoomend", () => {
			console.log(mapRef.current?.getZoom());
			refetch();
		});

		return () => mapRef.current?.remove();
	}, [refetch]);

	return (
		<div className="w-screen h-screen">
			<FloatingBox
				checked={showMainlandOnly}
				onChange={onShowMainlandOnlyChange}
			/>
			<div ref={mapContainerRef} className="w-full h-full" />
			{loading || isLoading ? <Loader /> : null}
		</div>
	);
}

export default App;
