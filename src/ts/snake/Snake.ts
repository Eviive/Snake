import { LevelFile } from "../types/game.js";
import { Shape, Circle } from "../shapes/index.js";

export class Snake {
	
	static #isBuilding: boolean = false;
	
	#canvas: HTMLCanvasElement;
	#ctx: CanvasRenderingContext2D;
	#level: LevelFile;
	
	#frame?: number;
	#then: DOMHighResTimeStamp | null = null;
	#now: DOMHighResTimeStamp | null = null;

	#shapes: Shape[] = [new Circle(50, 50, "#FFFFFF", 50), new Circle(50, 175, "#FF0000", 50)];
	
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

		this.#resize();
		const resizeHandler = () => this.#resize();
		window.addEventListener("resize", resizeHandler);
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

	#resize() {
		this.#canvas.width = 0;
		this.#canvas.height = 0;
		
		const parent = this.#canvas.parentElement;
		
		const parentWidth = parent?.clientWidth ?? 0;
		const parentHeight = parent?.clientHeight ?? 0;
		
		let canvasWidth = parentWidth;

		const ratio = this.#level.dimensions[0] / this.#level.dimensions[1];
		
		let canvasHeight = canvasWidth / ratio;

		if (canvasHeight > parentHeight) {
			canvasHeight = parentHeight;
			canvasWidth = canvasHeight * ratio;
		}

		this.#canvas.width = canvasWidth;
		this.#canvas.height = canvasHeight;
	}
	
	#render(time: DOMHighResTimeStamp) {
		this.#now = time;
		const delta = (this.#now - (this.#then ?? 0)) / 1000;
		this.#then = this.#now;
		
		this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
		
		for (const s of this.#shapes) {
			s.update(delta * this.#level.speed, this.#canvas.width - 50);
			
			s.draw(this.#ctx);
		}

		this.#frame = requestAnimationFrame(time => this.#render(time));
	}

	run() {
		requestAnimationFrame(time => {
			this.#then = time;
			this.#render(time);
		});
	}

}