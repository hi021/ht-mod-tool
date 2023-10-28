// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
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
			res: number; //whether researched (0 - locked, 1 - unlocked, 2 - researched)
			maxClock: number; //kHz
			maxCore: number; //highest supported core index
			img: string; //image name (eg. PLCC24)
		}
		interface Research {
			name: string;
			tab: string; //CPU or Tech
			category: string; //eg. DIP, PLCC, Core
			cost: number;
			resPoints: number;
			xp: number; //required cpu xp to unlock
			year: number; //min unlock year
			res: number; //whether researched (0 - locked, 1 - unlocked, 2 - researched)
			x: number; //position on R&D screen
			reqRes: number; //whether required tech is researched(?)
			y: number; //position on R&D screen
		}
	}
}

export {};
