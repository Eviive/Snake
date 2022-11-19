import { Shape, Square, Circle } from "../shapes/index.js";
import { Coordinates, Direction, GameMap, LevelFile, Tile } from "../types/game.js";
import { create2DArray } from "../utils/array.js";

export class Snake {
	
	static #isBuilding: boolean = false;
	
	#canvas: HTMLCanvasElement;
	#ctx: CanvasRenderingContext2D;
	#level: LevelFile;
	
	#frame?: number;
	#then: DOMHighResTimeStamp | null = null;
	#now: DOMHighResTimeStamp | null = null;

	#map: GameMap = [];
	#snake: Coordinates[] = [];
	#score: number = 0;

	#direction: Direction = Direction.Up;
	#treated: boolean = true;
	
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

		this.#createLevel();
		
		this.#resize();
		const resizeHandler = () => this.#resize();
		window.addEventListener("resize", resizeHandler);

		const keydownHandler = (e: KeyboardEvent) => {
			if (this.#treated === false) {
				return;
			}
			let direction: Direction | undefined;
			switch (e.key) {
				case "ArrowUp":
				case "z":
					direction = Direction.Up;
					break;
				
				case "ArrowRight":
				case "d":
					direction = Direction.Right;
					break;

				case "ArrowDown":
				case "s":
					direction = Direction.Down;
					break;

				case "ArrowLeft":
				case "q":
					direction = Direction.Left;
					break;
			}
			if (direction && -direction !== this.#direction) {
				this.#direction = direction;
				this.#treated = false;
			}
		};
		window.addEventListener("keydown", keydownHandler);
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
		if (this.#frame) {
			// cancelAnimationFrame(this.#frame);
			clearInterval(this.#frame);
		}
	}

	#createLevel() {
		const { dimensions: [width, height], walls, food, snake } = this.#level;
		
		this.#map = create2DArray(width, height, Tile.Empty);
		
		for (const [x, y] of walls) {
			this.#map[y][x] = Tile.Wall;
		}

		for (const [x, y] of food) {
			this.#map[y][x] = Tile.Food;
		}
		
		const head = snake.shift();
		if (!head) {
			throw new Error("The snake doesn't have a head");
		}
		this.#map[head[1]][head[0]] = Tile.SnakeHead;
		this.#snake.push(head);

		for (const [x, y] of snake) {
			this.#map[y][x] = Tile.SnakeBody;
			this.#snake.push([x, y]);
		}
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

	#getRandomEmptyTile() {
		const { dimensions: [width, height] } = this.#level;
		let tile: Coordinates;

		do {
			tile = [Math.floor(Math.random() * width), Math.floor(Math.random() * height)];
		} while (this.#map[tile[1]][tile[0]] !== Tile.Empty);
		
		return tile;
	}

	#write(text: string) {
		const fontSize = 100;
		const middleX = this.#canvas.width / 2;
		const middleY = this.#canvas.height / 2;
		
		this.#ctx.fillStyle = "rgba(163, 163, 163, 0.5)";
		this.#ctx.font = `bold ${fontSize}px Inter`;
		this.#ctx.textAlign = "center";
		this.#ctx.fillText(text, middleX, middleY + fontSize / 3);
	}

	#iterate() {
		const { dimensions: [width, height] } = this.#level;

		const [x, y] = this.#snake[0];
		let newX = x;
		let newY = y;

		switch (this.#direction) {
			case Direction.Up:
				newY--;
				break;

			case Direction.Right:
				newX++;
				break;

			case Direction.Down:
				newY++;
				break;

			case Direction.Left:
				newX--;
				break;
			
			default:
				throw new Error(`Unknown direction ${this.#direction}`);
		}
		this.#treated = true;
		
		if (newX < 0 || newX >= width || newY < 0 || newY >= height) {
			this.#cleanup();
			return;
		}

		let tile = this.#map[newY][newX];
		
		if (tile === Tile.Wall) {
			this.#cleanup();
			return;
		}

		let tail: Coordinates | undefined;
		if (tile === Tile.Food) {
			this.#score++;
			const newFood = this.#getRandomEmptyTile();
			this.#map[newFood[1]][newFood[0]] = Tile.Food;
		} else {
			tail = this.#snake.pop()!;
			this.#map[tail[1]][tail[0]] = Tile.Empty;
		}

		tile = this.#map[newY][newX];

		if (tile === Tile.SnakeBody) {
			if (tail) {
				this.#snake.push(tail);
				this.#map[tail[1]][tail[0]] = Tile.SnakeBody;
			}
			this.#cleanup();
			return;
		}

		this.#map[y][x] = Tile.SnakeBody;		
		this.#map[newY][newX] = Tile.SnakeHead;
		
		this.#snake.unshift([newX, newY]);

		if (this.#map[newY][newX] !== Tile.SnakeHead) {
			throw new Error("The snake's head is not where it should be");
		}
	}

	#drawMap() {
		const { dimensions: [width, height] } = this.#level;

		const cellWidth = this.#canvas.width / width;
		const cellHeight = this.#canvas.height / height;
		
		this.#write(this.#score.toString());
		
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const cell = this.#map[y][x];

				const shapes: Shape[] = [];
				
				switch (cell) {
					case Tile.Empty:
						break;

					case Tile.Wall:
						shapes.push(new Square(x * cellWidth, y * cellHeight, "gray", cellWidth));
						break;

					case Tile.Food:
						shapes.push(new Circle(x * cellWidth, y * cellHeight, "red", cellWidth / 2));
						break;

					case Tile.SnakeBody:
						shapes.push(new Square(x * cellWidth, y * cellHeight, "green", cellWidth));
						break;

					case Tile.SnakeHead:
						shapes.push(new Circle(x * cellWidth, y * cellHeight, "green", cellWidth / 2));
						shapes.push(new Circle(x * cellWidth + cellWidth / 1.5, y * cellHeight + cellHeight / 4, "red", cellWidth / 7));
						shapes.push(new Circle(x * cellWidth + cellWidth / 4.5, y * cellHeight + cellHeight / 4, "red", cellWidth / 7));
						break;

					default:
						throw new TypeError(`Unknown tile type ${cell}`);
				}

				for (const s of shapes) {
					s.draw(this.#ctx);
				}
			}
		}

		this.#iterate();
	}
	
	#render(time: DOMHighResTimeStamp) {
		console.log("render");
		
		this.#now = time;
		const delta = (this.#now - (this.#then ?? 0)) / 1000;
		this.#then = this.#now;
		
		this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
		
		this.#drawMap();

		// this.#frame = requestAnimationFrame(time => this.#render(time));
	}

	run() {
		// requestAnimationFrame(time => {
		// 	this.#then = time;
		// 	this.#render(time);
		// });
		this.#frame = setInterval(() => this.#render(0), this.#level.speed);
	}

}