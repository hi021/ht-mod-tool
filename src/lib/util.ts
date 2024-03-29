export const LEN_NAME = 30; //max lengths
export const LEN_AUTHOR = 24;
export const LEN_VERSION = 10;
export const HT_VERSION = "0.2.12";
export const MAX_RES_X = 110;
export const MAX_RES_Y = 19;

export function formatNumber(num: number | string, token = " "): string {
	return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, token);
}

/////////////////////////////////MOD PARSING
export function parseModMetadata(line: string): App.ModMetadata | null {
	const regMatch = line.matchAll(/\[([\w| ]+: )([^[\]]+)\]/g);
	const regMatchArr = [...regMatch];
	if (!regMatchArr.length) return null;

	const metaKeys = ["author", "name", "version", "gameVersion", "toolVersion"];
	const meta: Record<string, string> = {};
	let i = 0;
	for (const key of metaKeys) {
		const value = regMatchArr[i]?.[2]; //2nd regex group
		if (!value) return null;
		meta[key] = value;
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
			name: "none",
			cost: 0,
			time: 0,
			unit: 0,
			perf: 0,
			stab: 0,
			build: 0,
			res: 1,
			maxClock: 200,
			maxCore: "0",
			img: "DIP14"
		};
		const keys = Object.keys(pckg);

		for (const match of regMatch) {
			if (match[1] == null) return null; //first group

			const key = keys[i++];
			if (key == "name" || key == "img" || key == "maxCore") (pckg as any)[key] = String(match[1]);
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
			tab: "CPU",
			category: "Custom",
			cost: 0,
			resPoints: 0,
			xp: 0,
			year: 0,
			res: 1,
			x: 0,
			reqRes: 1,
			y: 0
		};
		const keys = Object.keys(res);
		for (const match of regMatch) {
			if (match[1] == null) return null; //first group

			const key = keys[i++];
			if (key == "name" || key == "tab" || key == "category") (res as any)[key] = String(match[1]);
			else (res as any)[key] = Number(match[1]);
		}
		research.push(res);

		if (modLines[startIndex].endsWith("}")) break;
	}

	return { research, lastLine: startIndex };
}

export function parseMod(modLines: string[]): App.ModData | null {
	if (modLines.length < 3) return null;
	if (!modLines[1].startsWith("--") || !modLines[1].endsWith("--")) return null;
	const meta = parseModMetadata(modLines[0]);
	if (!meta?.author) return null;

	const packages = parsePackages(modLines);
	if (!packages?.packages) return null;
	const research = parseResearch(modLines, packages.lastLine + 1);

	return { meta, packages: packages.packages, research: research?.research };
}

export function findResearch(research: App.Research[] | undefined, researchName: string) {
	if (!research?.length) return null;

	const id = research.findIndex((a) => a.name === researchName);
	if (id < 0) return null;

	const res = research[id];
	return { id, res };
}

export function parsePackageName(name: string) {
	const namePattern = new RegExp("(\\d+) pin ([A-Z()\\d\\'\"><=?!.,-_+@#$%^&*]+)", "i"); //e.g. 20 pin DIP
	const reg = namePattern.exec(name);
	if (!reg?.[0]) return null; //invalid name

	let packageType: "DIP" | "PLCC" | "PGA" | "Custom";
	const packageName = reg[2].slice(0, 10);
	if (packageName == "DIP" || packageName == "PLCC" || packageName == "PGA") packageType = packageName;
	else packageType = "Custom";
	const numPins = Math.min(Math.max(parseInt(reg[1]), 2), 9999); //2 - 9999

	return { packageName, packageType, numPins };
}

//all 0.2.12 game technologies
export const GAME_RESEARCH: App.BaseResearch[] = [
	{ name: "CPU Development", tab: "CPU", category: "CPU", cost: 5000, resPoints: 100, xp: 0, year: 1968, x: 1, y: 2 },
	{ name: "14 pin DIP", tab: "CPU", category: "DIP", cost: 5000, resPoints: 20, xp: 0, year: 1964, x: 2.2, y: 0 },
	{ name: "200kHz max clock speed", tab: "CPU", category: "Clock", cost: 5000, resPoints: 20, xp: 0, year: 1967, x: 2.2, y: 0 },
	{ name: "400kHz max clock speed", tab: "CPU", category: "Clock", cost: 3000, resPoints: 60, xp: 0, year: 1968, x: 3.4, y: 0 },
	{ name: "18 pin DIP", tab: "CPU", category: "DIP", cost: 7200, resPoints: 76, xp: 0, year: 1969, x: 3.4, y: 0 },
	{ name: "750kHz max clock speed", tab: "CPU", category: "Clock", cost: 10000, resPoints: 70, xp: 20, year: 1969, x: 4.7, y: 0 },
	{ name: "10 µm process", tab: "Tech", category: "Tech", cost: 5000, resPoints: 100, xp: 0, year: 1970, x: 1, y: 0 },
	{ name: "24 pin DIP", tab: "CPU", category: "DIP", cost: 13000, resPoints: 90, xp: 20, year: 1970, x: 4.6, y: 0 },
	{ name: "900kHz max clock speed", tab: "CPU", category: "Clock", cost: 12000, resPoints: 90, xp: 46, year: 1971, x: 6.4, y: 0 },
	{ name: "32 pin DIP", tab: "CPU", category: "DIP", cost: 16500, resPoints: 110, xp: 77, year: 1971, x: 6.5, y: 0 },
	{ name: "1.5MHz max clock speed", tab: "CPU", category: "Clock", cost: 16000, resPoints: 120, xp: 96, year: 1972, x: 9.2, y: 0 },
	{ name: "48 pin DIP", tab: "CPU", category: "DIP", cost: 22000, resPoints: 140, xp: 110, year: 1972, x: 8.1, y: 0 },
	{ name: "6 µm process", tab: "Tech", category: "Tech", cost: 10000, resPoints: 240, xp: 110, year: 1973, x: 2.5, y: 0 },
	{ name: "24 pin PLCC", tab: "CPU", category: "PLCC", cost: 35000, resPoints: 200, xp: 180, year: 1973, x: 8.1, y: 0 },
	{ name: "2.5MHz max clock speed", tab: "CPU", category: "Clock", cost: 23000, resPoints: 160, xp: 145, year: 1974, x: 11, y: 0 },
	{ name: "32 pin PLCC", tab: "CPU", category: "PLCC", cost: 35000, resPoints: 140, xp: 200, year: 1974, x: 9.4, y: 0 },
	{ name: "3 µm process", tab: "Tech", category: "Tech", cost: 18000, resPoints: 300, xp: 260, year: 1975, x: 4, y: 0 },
	{ name: "48 pin PLCC", tab: "CPU", category: "PLCC", cost: 35000, resPoints: 155, xp: 210, year: 1975, x: 10.8, y: 0 },
	{ name: "56 pin DIP", tab: "CPU", category: "DIP", cost: 26000, resPoints: 155, xp: 150, year: 1975, x: 10, y: 0 },
	{ name: "64 pin DIP", tab: "CPU", category: "DIP", cost: 29000, resPoints: 175, xp: 190, year: 1975, x: 11.5, y: 0 },
	{ name: "4MHz max clock speed", tab: "CPU", category: "Clock", cost: 30000, resPoints: 205, xp: 210, year: 1976, x: 12.6, y: 0 },
	{ name: "56 pin PLCC", tab: "CPU", category: "PLCC", cost: 36000, resPoints: 175, xp: 235, year: 1976, x: 12.2, y: 0 },
	{ name: "6.5MHz max clock speed", tab: "CPU", category: "Clock", cost: 40000, resPoints: 255, xp: 270, year: 1977, x: 14, y: 0 },
	{ name: "64 pin PLCC", tab: "CPU", category: "PLCC", cost: 38000, resPoints: 205, xp: 260, year: 1977, x: 13.6, y: 0 },
	{ name: "72 pin DIP", tab: "CPU", category: "DIP", cost: 33000, resPoints: 200, xp: 220, year: 1977, x: 13, y: 0 },
	{ name: "9MHz max clock speed", tab: "CPU", category: "Clock", cost: 52000, resPoints: 295, xp: 310, year: 1977, x: 15.9, y: 0 },
	{ name: "72 pin PLCC", tab: "CPU", category: "PLCC", cost: 43000, resPoints: 230, xp: 287, year: 1977, x: 15.1, y: 0 },
	{ name: "84 pin PLCC", tab: "CPU", category: "PLCC", cost: 48000, resPoints: 240, xp: 315, year: 1978, x: 16.7, y: 0 },
	{ name: "12MHz max clock speed", tab: "CPU", category: "Clock", cost: 64000, resPoints: 345, xp: 375, year: 1979, x: 17.6, y: 0 },
	{ name: "48 pin PGA", tab: "CPU", category: "PGA", cost: 90000, resPoints: 280, xp: 430, year: 1979, x: 16.7, y: 0 },
	{ name: "60 pin PGA", tab: "CPU", category: "PGA", cost: 130000, resPoints: 200, xp: 440, year: 1979, x: 18.1, y: 0 },
	{ name: "96 pin PLCC", tab: "CPU", category: "PLCC", cost: 51000, resPoints: 250, xp: 345, year: 1979, x: 18.6, y: 0 },
	{ name: "78 pin PGA", tab: "CPU", category: "PGA", cost: 145000, resPoints: 210, xp: 490, year: 1980, x: 19.5, y: 0 },
	{ name: "116 pin PLCC", tab: "CPU", category: "PLCC", cost: 58000, resPoints: 262, xp: 400, year: 1980, x: 20.2, y: 0 },
	{ name: "1.5 µm process", tab: "Tech", category: "Tech", cost: 40000, resPoints: 380, xp: 420, year: 1981, x: 5.5, y: 0 },
	{ name: "15MHz max clock speed", tab: "CPU", category: "Clock", cost: 80000, resPoints: 380, xp: 480, year: 1981, x: 19.2, y: 0 },
	{ name: "96 pin PGA", tab: "CPU", category: "PGA", cost: 150000, resPoints: 250, xp: 505, year: 1981, x: 21, y: 0 },
	{ name: "136 pin PLCC", tab: "CPU", category: "PLCC", cost: 66000, resPoints: 270, xp: 440, year: 1982, x: 21.8, y: 0 },
	{ name: "112 pin PGA", tab: "CPU", category: "PGA", cost: 150000, resPoints: 275, xp: 560, year: 1982, x: 22.6, y: 0 },
	{ name: "136 pin PGA", tab: "CPU", category: "PGA", cost: 150000, resPoints: 300, xp: 580, year: 1982, x: 24.2, y: 0 },
	{ name: "20MHz max clock speed", tab: "CPU", category: "Clock", cost: 105000, resPoints: 425, xp: 530, year: 1983, x: 21.2, y: 0 },
	{ name: "1 µm process", tab: "Tech", category: "Tech", cost: 60000, resPoints: 440, xp: 510, year: 1983, x: 7, y: 0 },
	{ name: "156 pin PLCC", tab: "CPU", category: "PLCC", cost: 75000, resPoints: 290, xp: 500, year: 1983, x: 23.3, y: 0 },
	{ name: "25MHz max clock speed", tab: "CPU", category: "Clock", cost: 125000, resPoints: 460, xp: 580, year: 1984, x: 22.9, y: 0 },
	{ name: "152 pin PGA", tab: "CPU", category: "PGA", cost: 125000, resPoints: 330, xp: 630, year: 1984, x: 25.7, y: 0 },
	{ name: "182 pin PLCC", tab: "CPU", category: "PLCC", cost: 80000, resPoints: 305, xp: 570, year: 1985, x: 24.9, y: 0 },
	{ name: "176 pin PGA", tab: "CPU", category: "PGA", cost: 129000, resPoints: 355, xp: 660, year: 1985, x: 27.3, y: 0 },
	{ name: "800 nm process", tab: "Tech", category: "Tech", cost: 104000, resPoints: 496, xp: 650, year: 1986, x: 8.5, y: 0 },
	{ name: "30MHz max clock speed", tab: "CPU", category: "Clock", cost: 150000, resPoints: 485, xp: 700, year: 1986, x: 24.4, y: 0 },
	{ name: "208 pin PLCC", tab: "CPU", category: "PLCC", cost: 85000, resPoints: 328, xp: 615, year: 1986, x: 26.6, y: 0 },
	{ name: "200 pin PGA", tab: "CPU", category: "PGA", cost: 135000, resPoints: 375, xp: 700, year: 1986, x: 28.9, y: 0 },
	{ name: "240 pin PLCC", tab: "CPU", category: "PLCC", cost: 91000, resPoints: 350, xp: 680, year: 1987, x: 28.2, y: 0 },
	{ name: "224 pin PGA", tab: "CPU", category: "PGA", cost: 144000, resPoints: 400, xp: 730, year: 1987, x: 30.4, y: 0 },
	{ name: "35MHz max clock speed", tab: "CPU", category: "Clock", cost: 195000, resPoints: 490, xp: 780, year: 1987, x: 25.8, y: 0 },
	{ name: "248 pin PGA", tab: "CPU", category: "PGA", cost: 160000, resPoints: 425, xp: 780, year: 1988, x: 31.9, y: 0 },
	{ name: "40MHz max clock speed", tab: "CPU", category: "Clock", cost: 212000, resPoints: 500, xp: 810, year: 1989, x: 26.8, y: 0 },
	{ name: "48MHz max clock speed", tab: "CPU", category: "Clock", cost: 225000, resPoints: 510, xp: 840, year: 1989, x: 28, y: 0 },
	{ name: "600 nm process", tab: "Tech", category: "Tech", cost: 140000, resPoints: 560, xp: 760, year: 1990, x: 10, y: 0 },
	{ name: "282 pin PGA", tab: "CPU", category: "PGA", cost: 162800, resPoints: 450, xp: 830, year: 1990, x: 33.5, y: 0 },
	{ name: "60MHz max clock speed", tab: "CPU", category: "Clock", cost: 250000, resPoints: 555, xp: 866, year: 1991, x: 29.4, y: 0 },
	{ name: "320 pin PGA", tab: "CPU", category: "PGA", cost: 175000, resPoints: 480, xp: 885, year: 1992, x: 35, y: 0 },
	{ name: "350 nm process", tab: "Tech", category: "Tech", cost: 170000, resPoints: 580, xp: 900, year: 1993, x: 11.5, y: 0 },
	{ name: "70MHz max clock speed", tab: "CPU", category: "Clock", cost: 277000, resPoints: 590, xp: 920, year: 1993, x: 31.2, y: 0 },
	{ name: "380 pin PGA", tab: "CPU", category: "PGA", cost: 181000, resPoints: 500, xp: 930, year: 1994, x: 36.4, y: 0 },
	{ name: "95MHz max clock speed", tab: "CPU", category: "Clock", cost: 294000, resPoints: 630, xp: 955, year: 1994, x: 32.7, y: 0 },
	{ name: "130MHz max clock speed", tab: "CPU", category: "Clock", cost: 312000, resPoints: 675, xp: 1040, year: 1995, x: 34.5, y: 0 },
	{ name: "250 nm process", tab: "Tech", category: "Tech", cost: 200000, resPoints: 620, xp: 1010, year: 1996, x: 13, y: 0 },
	{ name: "456 pin PGA", tab: "CPU", category: "PGA", cost: 170000, resPoints: 520, xp: 977, year: 1996, x: 38, y: 0 },
	{ name: "210MHz max clock speed", tab: "CPU", category: "Clock", cost: 333000, resPoints: 705, xp: 1060, year: 1996, x: 36.2, y: 0 },
	{ name: "335MHz max clock speed", tab: "CPU", category: "Clock", cost: 349000, resPoints: 750, xp: 1090, year: 1997, x: 37.9, y: 0 },
	{ name: "Experimental dual-core", tab: "CPU", category: "Core", cost: 500000, resPoints: 800, xp: 1090, year: 1998, x: 39, y: 0 },
	{ name: "544 pin PGA", tab: "CPU", category: "PGA", cost: 173000, resPoints: 510, xp: 1010, year: 1998, x: 39.8, y: 0 },
	{ name: "486MHz max clock speed", tab: "CPU", category: "Clock", cost: 380000, resPoints: 795, xp: 1116, year: 1998, x: 39.7, y: 0 },
	{ name: "180 nm process", tab: "Tech", category: "Tech", cost: 222000, resPoints: 680, xp: 1078, year: 1999, x: 14.5, y: 0 },
	{ name: "618 pin PGA", tab: "CPU", category: "PGA", cost: 180000, resPoints: 515, xp: 1044, year: 1999, x: 41.7, y: 0 },
	{ name: "760MHz max clock speed", tab: "CPU", category: "Clock", cost: 415000, resPoints: 850, xp: 1200, year: 1999, x: 41.5, y: 0 },
	{ name: "Basic dual-core", tab: "CPU", category: "Core", cost: 430000, resPoints: 900, xp: 1160, year: 2000, x: 42.1, y: 0 },
	{ name: "1.1GHz max clock speed", tab: "CPU", category: "Clock", cost: 440000, resPoints: 910, xp: 1230, year: 2000, x: 43.5, y: 0 },
	{ name: "1.4GHz max clock speed", tab: "CPU", category: "Clock", cost: 520000, resPoints: 920, xp: 1290, year: 2000, x: 45.2, y: 0 },
	{ name: "130 nm process", tab: "Tech", category: "Tech", cost: 260000, resPoints: 780, xp: 1190, year: 2001, x: 16, y: 0 },
	{ name: "1.8GHz max clock speed", tab: "CPU", category: "Clock", cost: 310000, resPoints: 910, xp: 1320, year: 2001, x: 46.9, y: 0 },
	{ name: "754 pin PGA", tab: "CPU", category: "PGA", cost: 190000, resPoints: 525, xp: 1090, year: 2001, x: 44.2, y: 0 },
	{ name: "Dual-core", tab: "CPU", category: "Core", cost: 520000, resPoints: 1050, xp: 1440, year: 2002, x: 46.6, y: 0 },
	{ name: "2.1GHz max clock speed", tab: "CPU", category: "Clock", cost: 300000, resPoints: 920, xp: 1340, year: 2002, x: 48.5, y: 0 },
	{ name: "870 pin PGA", tab: "CPU", category: "PGA", cost: 197000, resPoints: 542, xp: 1114, year: 2002, x: 47, y: 0 },
	{ name: "2.5GHz max clock speed", tab: "CPU", category: "Clock", cost: 700000, resPoints: 920, xp: 1365, year: 2002, x: 50, y: 0 },
	{ name: "90 nm process", tab: "Tech", category: "Tech", cost: 290000, resPoints: 895, xp: 1300, year: 2003, x: 17.5, y: 0 },
	{ name: "2.7GHz max clock speed", tab: "CPU", category: "Clock", cost: 320000, resPoints: 930, xp: 1406, year: 2003, x: 51.8, y: 0 },
	{ name: "3GHz max clock speed", tab: "CPU", category: "Clock", cost: 250000, resPoints: 950, xp: 1420, year: 2003, x: 53.2, y: 0 },
	{ name: "940 pin PGA", tab: "CPU", category: "PGA", cost: 207000, resPoints: 555, xp: 1220, year: 2004, x: 50, y: 0 },
	{ name: "3.4GHz max clock speed", tab: "CPU", category: "Clock", cost: 340000, resPoints: 990, xp: 1456, year: 2004, x: 54.8, y: 0 },
	{ name: "65 nm process", tab: "Tech", category: "Tech", cost: 322000, resPoints: 955, xp: 1434, year: 2005, x: 19, y: 0 },
	{ name: "1086 pin PGA", tab: "CPU", category: "PGA", cost: 250000, resPoints: 570, xp: 1284, year: 2005, x: 55, y: 0 },
	{ name: "3.8GHz max clock speed", tab: "CPU", category: "Clock", cost: 390000, resPoints: 1010, xp: 1480, year: 2005, x: 56.5, y: 0 },
	{ name: "Triple-core", tab: "CPU", category: "Core", cost: 900000, resPoints: 1070, xp: 1500, year: 2005, x: 57, y: 0 },
	{ name: "4GHz max clock speed", tab: "CPU", category: "Clock", cost: 442000, resPoints: 1040, xp: 1540, year: 2006, x: 58.2, y: 0 },
	{ name: "1207 pin PGA", tab: "CPU", category: "PGA", cost: 275000, resPoints: 586, xp: 1340, year: 2006, x: 58, y: 0 },
	{ name: "Quad-core", tab: "CPU", category: "Core", cost: 700000, resPoints: 1030, xp: 1637, year: 2006, x: 60.4, y: 0 },
	{ name: "45 nm process", tab: "Tech", category: "Tech", cost: 380000, resPoints: 1010, xp: 1600, year: 2007, x: 20.5, y: 0 },
	{ name: "1366 pin PGA", tab: "CPU", category: "PGA", cost: 300000, resPoints: 600, xp: 1400, year: 2007, x: 60, y: 0 },
	{
		name: "Multi-core enhancement",
		tab: "Tech",
		category: "Core Tech",
		cost: 885000,
		resPoints: 900,
		xp: 1800,
		year: 2008,
		x: 21.5,
		y: 2
	}
];
