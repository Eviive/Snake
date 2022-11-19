import { Shape } from "./Shape.js";

export class Square extends Shape {

	#size: number;
	
	constructor(x: number, y: number, color: string, size: number) {
		super(x, y, color);
		this.#size = size;
	}

	update(velocity: number, max: number) {
		this.x += velocity;
		
		if (this.x > max) {
			this.x = 50;
		}
	}
	
	draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x, this.y, this.#size, this.#size);
	}
	
}