import { Shape } from "./Shape.js";

export class Circle extends Shape {

	#radius: number;
	
	constructor(x: number, y: number, color: string, radius: number) {
		super(x, y, color);
		this.#radius = Math.floor(radius);
	}

	update(velocity: number, max: number) {
		this.x += velocity;
		
		if (this.x > max) {
			this.x = 50;
		}
	}
	
	draw(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = this.color;
		ctx.beginPath();
		
		ctx.arc(this.x + this.#radius, this.y + this.#radius, this.#radius, 0, 2 * Math.PI);

		ctx.closePath();
		ctx.fill();
	}
	
}