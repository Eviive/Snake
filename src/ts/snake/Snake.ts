import { LevelFile } from "../types/game.js";

export class Snake {
	
	static #isBuilding = false;
	
	#canvas: HTMLCanvasElement;
	#ctx: CanvasRenderingContext2D;
	#level: LevelFile;
	#interval?: number;
	
	constructor(level: LevelFile) {
		if (!Snake.#isBuilding) {
			throw new Error("Snake can only be built using the builder method");
		}
		
		const canvas = document.querySelector("canvas");
		if (!canvas) {
			throw new Error("Couldn't find the game's #canvas");
		}
		this.#canvas = canvas;

		const ctx = this.#canvas.getContext("2d", { alpha: false });
		if (!ctx) {
			throw new Error("Couldn't get the #canvas' context");
		}
		this.#ctx = ctx;

		this.#level = level;
	}

	static async builder(levelId: number) {
		Snake.#isBuilding = true;
		try {
			const module = await import(`../../assets/levels/level-${levelId}.json`, {
				assert: { type: "json" }
			});
			
			const level = module.default as LevelFile;

			return new this(level);
		} catch (e) {
			console.error(e);
			throw new Error(`Couldn't import the level ${levelId}'s file`, { cause: e });
		} finally {
			Snake.#isBuilding = false;
		}
	}
	
	#cleanup() {
		// TODO
	}
	
	#render() {
		console.log("Snake.render()");
	}

	run() {
		this.#interval = setInterval(() => this.#render(), this.#level.delay);
	}

}