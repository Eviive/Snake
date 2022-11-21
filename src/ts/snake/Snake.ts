import { SnakeSprite } from "ts/game/SnakeSprite.js";
import { Coordinates, Direction, SnakePartType, SnakeSpriteType } from "../types/game.js";

export class Snake {
	
	static #parts: Snake[] = [];
	
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

	get direction() {
		return this.#direction;
	}
	
	static getHead() {
		return this.#parts[0];
	}

	static removeLast() {
		return this.#parts.pop()!; // TODO: remove bangs in whole project
	}

	#getType(): SnakePartType {
		switch (Snake.#parts.indexOf(this)) {
			case 0:
				return SnakePartType.Head;
		
			case Snake.#parts.length - 1:
				return SnakePartType.Tail;
				
			default:
				return SnakePartType.Body;
		}
	}

	getPreviousPart() {
		return Snake.#parts[Snake.#parts.indexOf(this) - 1];
	}
	
	getNextPart() {
		return Snake.#parts[Snake.#parts.indexOf(this) + 1];
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
		
		if (partType === SnakePartType.Head) {
			switch (this.#direction) {
				case Direction.Up:
					spriteType = SnakeSpriteType.HeadUp;
					break;
				
				case Direction.Right:
					spriteType = SnakeSpriteType.HeadRight;
					break;

				case Direction.Down:
					spriteType = SnakeSpriteType.HeadDown;
					break;

				case Direction.Left:
					spriteType = SnakeSpriteType.HeadLeft;
					break;
			
				default:
					throw new Error(`Unknown direction: ${this.#direction}`);
			}
		} else if (partType === SnakePartType.Body) {
			switch (this.#direction) {
				case Direction.Up:
				case Direction.Down:
					spriteType = SnakeSpriteType.BodyVertical;
					break;

				case Direction.Right:
				case Direction.Left:
					spriteType = SnakeSpriteType.BodyHorizontal;
					break;
			
				default:
					throw new Error(`Unknown direction: ${this.#direction}`);
			}
		} else if (partType === SnakePartType.Tail) {
			const previousDirection = this.getPreviousPart().#direction;

			switch (previousDirection) {
				case Direction.Up:
					spriteType = SnakeSpriteType.TailDown;
					break;

				case Direction.Right:
					spriteType = SnakeSpriteType.TailLeft;
					break;

				case Direction.Down:
					spriteType = SnakeSpriteType.TailUp;
					break;

				case Direction.Left:
					spriteType = SnakeSpriteType.TailRight;
					break;

				default:
					throw new Error(`Unknown direction: ${previousDirection}`);
			}
		} else {
			throw new Error(`Unknown snake part type: ${partType}`);
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