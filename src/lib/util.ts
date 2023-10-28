export function formatNumber(num: number | string, token = " "): string {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, token);
}

/////////////////////////////////MOD PARSING
export function parseModMetadata(line: string): App.ModMetadata | null {
	const regMatch = line.matchAll(/\[([\w| ]+: )([^[\]]+)\]/g);
	if (!regMatch) return null;

	const metaKeys = ["author", "name", "version", "gameVersion", "toolVersion"];
	const meta: Record<string, string> = {};
	let i = 0;
	for (const match of regMatch) {
		if (!match[2]) return null; //2nd group
		meta[metaKeys[i]] = match[2];
		++i;
	}

	return meta as unknown as App.ModMetadata;
}

function parsePackages(modLines: string[], startIndex = 2) {
	if (modLines[startIndex] !== "Packages{") return null;

	++startIndex;
	const packages: Array<App.Package> = [];
	for (; startIndex < modLines.length; startIndex++) {
		const regMatch = modLines[startIndex].matchAll(/(.*?)(?:\||;)/gi);
		if (!regMatch) return null;

		let i = 0;
		const pckg: App.Package = {
			name: "null",
			cost: 0,
			time: 0,
			unit: 0,
			perf: 0,
			stab: 0,
			build: 0,
			res: 1,
			maxClock: 0,
			maxCore: 0,
			img: "DIP14"
		};
		const keys = Object.keys(pckg);

		for (const match of regMatch) {
			if (!match[1]) return null; //first group

			const key = keys[i++];
			if (key == "name" || "img") (pckg as any)[key] = String(match[1]);
			else (pckg as any)[key] = Number(match[1]);
		}
		packages.push(pckg);

		if (modLines[startIndex].endsWith("}")) break;
	}

	return { packages, lastLine: startIndex };
}

function parseResearch(modLines: string[], startIndex: number) {
	if (modLines[startIndex] !== "Research{") return null;

	++startIndex;
	const research: Array<App.Research> = [];
	for (; startIndex < modLines.length; startIndex++) {
		const regMatch = modLines[startIndex].matchAll(/(.*?)(?:\||;)/gi);
		if (!regMatch) return null;

		let i = 0;
		const res: App.Research = {
			name: "null",
			tab: null,
			category: null,
			cost: 0,
			resPoints: 0,
			xp: 0,
			year: 0,
			res: 1,
			x: 0,
			reqRes: 0,
			y: 0
		};
		const keys = Object.keys(res);
		for (const match of regMatch) {
			if (!match[1]) return null; //first group
			(res as any)[keys[i++]] = match[1];
		}
		research.push(res);

		if (modLines[startIndex].endsWith("}")) break;
	}

	return { research, lastLine: startIndex };
}

export function parseMod(modLines: string[]): App.ModData | null {
	if (modLines.length < 3) return null;
	if (modLines[1] !== "--Generated by Hardware Tycoon Mod Tool by Haxor--") return null;
	const meta = parseModMetadata(modLines[0]);
	if (!meta) return null;

	const packages = parsePackages(modLines);
	if (!packages?.packages) return null;
	const research = parseResearch(modLines, packages.lastLine + 1);

	return { meta, packages: packages.packages, research: research?.research };
}
