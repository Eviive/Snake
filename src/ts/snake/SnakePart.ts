import { SnakeSprite } from "ts/game/SnakeSprite.js";
import { Coordinates, Direction, SnakePartType, SnakeSpriteType } from "../types/game.js";

export class SnakePart {
	
	static #parts: SnakePart[] = [];
	
	#coordinates: Coordinates;
	#direction: Direction;
	
	private constructor(coordinates: Coordinates, direction: Direction) {
		this.#coordinates = coordinates;
		this.#direction = direction;
	}

	static get parts() { // don't need that if i manage to overcome overload
		return this.#parts;
	}

	get coordinates() { // need that for iterating I think, maybe I can manage to remove it and do the iteration here
		return this.#coordinates;
	}

	static getHead() {
		return this.#parts[0];
	}

	static removeLast() {
		return this.#parts.pop()!; // TODO: remove bangs in whole project
	}

	#getType(): SnakePartType {
		switch (SnakePart.#parts.indexOf(this)) {
			case 0:
				return SnakePartType.Head;
		
			case SnakePart.#parts.length - 1:
				return SnakePartType.Tail;
				
			default:
				return SnakePartType.Body;
		}
	}

	static addPart(coordinates: Coordinates, direction: Direction, unshift: boolean = false): number {
		const part = new this(coordinates, direction);
		
		return unshift
			? this.#parts.unshift(part)
			: this.#parts.push(part);
	}


	static findPart([x, y]: Coordinates) {
		return this.#parts.find(part => part.coordinates[0] === x && part.coordinates[1] === y)
	}

	#adjustCoordinates([x, y]: Coordinates, delta: number, direction: Direction): Coordinates {
		switch (direction) {
			case Direction.Up:
				y -= delta;
				break;

			case Direction.Right:
				x += delta;
				break;

			case Direction.Down:
				y += delta;
				break;

			case Direction.Left:
				x -= delta;
				break;

			default:
				throw new Error(`Unknown direction ${direction}`);
		}

		return [x, y];
	}

	#drawPart(ctx: CanvasRenderingContext2D, sprite: SnakeSprite, x: number, y: number, width: number, height: number, partType: SnakePartType): void {		
		let spriteType;

		switch (partType) { // switch with multiple paramters SO HELP ?
			case SnakePartType.Head:
				spriteType = SnakeSpriteType.HeadUp; // TODO: determine right sprite
				break;
			
			case SnakePartType.Body:
				spriteType = SnakeSpriteType.BodyVertical; // TODO: determine right sprite
				break;

			case SnakePartType.Tail:
				spriteType = SnakeSpriteType.TailDown; // TODO: determine right sprite
				break;
				
			default:
				throw new Error(`Unknown snake part type ${partType}`);
		}

		sprite.drawSprite(ctx, spriteType, { x, y, width, height });
	}

	draw(ctx: CanvasRenderingContext2D, sprite: SnakeSprite, width: number, height: number, delta: number): void {
		let [x, y] = this.#adjustCoordinates(this.#coordinates, delta, this.#direction);
		
		x = x * width;
		y = y * height;
		
		this.#drawPart(ctx, sprite, x, y, width, height, this.#getType());
	}

}