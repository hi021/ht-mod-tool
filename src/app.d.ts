declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}

		type GameVersion = "0.2.8" | "0.2.8.1" | "0.2.8.2" | "0.2.8.3" | "0.2.9" | "0.2.10" | "0.2.11" | "0.2.12"; //HT version
		interface ModMetadata {
			author: string;
			name: string;
			version: string; //mod version
			gameVersion: string; //supported HT version
			toolVersion: string; //used mod tool version
		}
		interface ModData {
			meta: ModMetadata;
			packages: Package[];
			research?: Research[];
		}

		//keys in order of appearance in .htmod
		interface Package {
			name: string;
			cost: number; //design cost
			time: number; //design time (D)
			unit: number; //unit cost
			perf: number; //performance
			stab: number; //stability
			build: number;
			res: 0 | 1; //whether researched (0 - has to be researched, 1 - available in design)
			maxClock: number; //kHz
			maxCore: string; //highest supported core index ("0" - "5")
			img: string; //image name (e.g. PLCC24)
		}
		interface BaseResearch {
			name: string; //must match package name
			tab: string; //CPU or Tech (always CPU in this case)
			category: string; //e.g. DIP, Clock, Core (DIP, PLCC, PGA or Custom in this case)
			cost: number;
			resPoints: number;
			xp: number; //required cpu xp to unlock
			year: number; //min unlock year
			x: number; //position on R&D screen
			y: number; //position on R&D screen
		}
		interface Research extends BaseResearch {
			res: 0 | 1 | 2; //whether researched (0 - locked, 1 - unlocked, 2 - researched, should always be 1 in this case)
			reqRes: number; //whether required tech is researched (unused)
		}
	}
}

export {};
