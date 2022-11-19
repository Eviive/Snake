export abstract class Shape {

	#x: number;
	#y: number;
	#color: string;
	
	constructor(x: number, y: number, color: string) {
		this.#x = x;
		this.#y = y;
		this.#color = color;
	}

	protected get x() {
		return this.#x;
	}

	protected set x(x: number) {
		this.#x = x;
	}

	protected get y() {
		return this.#y;
	}

	protected set y(y: number) {
		this.#y = y;
	}

	protected get color() {
		return this.#color;
	}

	protected set color(color: string) {
		this.#color = color;
	}

	abstract update(velocity: number, max: number): void;

	abstract draw(ctx: CanvasRenderingContext2D): void;
	
}