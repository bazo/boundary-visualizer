// Distinct color generator (~200+) using OKLCH -> sRGB hex
// No dependencies. TS/JS compatible.

export function generateDistinctColors(n: number): string[] {
	const colors: string[] = [];
	const phi = 137.508; // golden angle in degrees
	const lightnessCycle = [0.72, 0.65, 0.58]; // alternate to avoid similarity
	const baseChroma = 0.12; // safe-ish OKLCH chroma that maps well to sRGB

	let lastHue = Math.random() * 360; // randomize start so runs differ

	for (let i = 0; i < n; i++) {
		// propose hue using golden-angle jump
		let h = (lastHue + phi) % 360;

		// if too close to previous hue, advance one more step
		if (angularDist(h, lastHue) < 20) h = (h + phi) % 360;
		lastHue = h;

		const L = lightnessCycle[i % lightnessCycle.length];
		let C = baseChroma;

		// try to bring color into sRGB gamut by reducing chroma if needed
		let hex = oklchToHex(L, C, h);
		let tries = 0;
		while (!hex && C > 0.02 && tries < 10) {
			C *= 0.85;
			hex = oklchToHex(L, C, h);
			tries++;
		}
		// as a last resort, fall back to grayscale at that L
		colors.push(hex ?? oklchToHex(L, 0, h)!);
	}
	return colors;
}

function angularDist(a: number, b: number): number {
	let d = Math.abs(a - b) % 360;
	if (d > 180) d = 360 - d;
	return d;
}

// ---- Color math: OKLCH -> OKLab -> linear sRGB -> sRGB -> hex ----
// Based on Björn Ottosson’s OKLab spec (public domain)

function oklchToHex(L: number, C: number, hDeg: number): string | null {
	const h = (hDeg * Math.PI) / 180;
	const a = C * Math.cos(h);
	const b = C * Math.sin(h);
	return oklabToHex(L, a, b);
}

function oklabToHex(L: number, a: number, b: number): string | null {
	// OKLab -> LMS
	const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
	const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
	const s_ = L - 0.0894841775 * a - 1.291485548 * b;

	const l = l_ ** 3;
	const m = m_ ** 3;
	const s = s_ ** 3;

	// LMS -> linear sRGB
	let r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
	let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
	let b_ = +0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

	// gamut check + clip test; if out-of-gamut, signal caller to reduce chroma
	if (r < 0 || r > 1 || g < 0 || g > 1 || b_ < 0 || b_ > 1) {
		// Try a soft clip to see if it's acceptable; if not, return null
		const soft = softClip([r, g, b_]);
		if (!soft) return null;
		[r, g, b_] = soft;
	}

	// linear -> gamma sRGB
	const R = linearToSrgb(r);
	const G = linearToSrgb(g);
	const B = linearToSrgb(b_);

	return rgbToHex(R, G, B);
}

function linearToSrgb(u: number): number {
	return u <= 0.0031308 ? 12.92 * u : 1.055 * u ** (1 / 2.4) - 0.055;
}

function softClip(rgb: number[]): [number, number, number] | null {
	// simple soft clip into [0,1]
	let [r, g, b] = rgb;
	r = Math.min(1, Math.max(0, r));
	g = Math.min(1, Math.max(0, g));
	b = Math.min(1, Math.max(0, b));
	// if clipping was massive (over 0.1 per channel), signal to reduce chroma
	const tooMuch =
		Math.abs(rgb[0] - r) > 0.1 ||
		Math.abs(rgb[1] - g) > 0.1 ||
		Math.abs(rgb[2] - b) > 0.1;
	return tooMuch ? null : [r, g, b];
}

function rgbToHex(R: number, G: number, B: number): string {
	const toByte = (x: number) => Math.min(255, Math.max(0, Math.round(x * 255)));
	const r = toByte(R);
	const g = toByte(G);
	const b = toByte(B);
	return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// --- Example usage ---
// const countries = ["Slovakia", "Czechia", "Austria", ...];
// const palette = generateDistinctColors(countries.length);
// const colorByCountry = new Map(countries.map((c, i) => [c, palette[i]]));

// Deterministic distinct colors by country name

export function colorForCountry(name: string, index: number): string {
	// jednoduchý hash podľa mena
	const seed = hashString(name);
	const phi = 137.508;
	const h = (seed * phi) % 360;

	// cyklovanie svetlosti a chromy podľa indexu
	const lightnessCycle = [0.72, 0.65, 0.58];
	const L = lightnessCycle[index % lightnessCycle.length];
	const C = 0.12;

	let hex = oklchToHex(L, C, h);
	if (!hex) hex = oklchToHex(L, 0.05, h)!; // fallback
	return hex;
}

function hashString(str: string): number {
	let h = 0;
	for (let i = 0; i < str.length; i++) {
		h = (h * 31 + str.charCodeAt(i)) >>> 0;
	}
	return h;
}

export function previewColor(hex: string, label = "") {
	const rgb = hexToRgb(hex);
	if (!rgb) return console.log(hex, label);

	const { r, g, b } = rgb;
	const brightness = (r * 299 + g * 587 + b * 114) / 1000; // ITU-R BT.601
	const textColor = brightness > 128 ? "#000" : "#fff";

	console.log(
		`%c ${label || hex} `,
		`background: ${hex}; color: ${textColor}; padding: 2px 6px; border-radius: 3px;`,
	);
}

function hexToRgb(hex: string) {
	const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!m) return null;
	return {
		r: Number.parseInt(m[1], 16),
		g: Number.parseInt(m[2], 16),
		b: Number.parseInt(m[3], 16),
	};
}
