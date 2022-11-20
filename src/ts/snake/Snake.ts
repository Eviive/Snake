import { Square, Circle } from "../shapes/index.js";
import { Coordinates, Direction, GameMap, LevelFile, SnakePart, Tile } from "../types/game.js";
import { create2DArray } from "../utils/array.js";

export class Snake {
	
	static #isBuilding: boolean = false;
	
	#bgCtx: CanvasRenderingContext2D;
	#fgCtx: CanvasRenderingContext2D;

	#level: LevelFile;
	
	#frame?: number;
	#then?: DOMHighResTimeStamp;
	#now?: DOMHighResTimeStamp;
	#elapsed: DOMHighResTimeStamp = 0;

	#map: GameMap = [];
	#snake: SnakePart[] = [];
	#score: number = 0;

	#direction: Direction = Direction.Up;
	#treated: boolean = true;
	
	constructor(level: LevelFile) {
		if (!Snake.#isBuilding) {
			throw new Error("Snake can only be built using the builder method");
		}
		
		const bgCanvas = document.querySelector<HTMLCanvasElement>("canvas#background-canvas");
		const fgCanvas = document.querySelector<HTMLCanvasElement>("canvas#foreground-canvas");

		if (!bgCanvas || !fgCanvas) {
			throw new Error("Couldn't find all of the game's canvases");
		}

		const bgCtx = bgCanvas.getContext("2d", { alpha: false });
		const fgCtx = fgCanvas.getContext("2d", { alpha: true });

		if (!bgCtx || !fgCtx) {
			throw new Error("Couldn't get all the canvas' contexts");
		}
		
		this.#bgCtx = bgCtx,
		this.#fgCtx = fgCtx;

		this.#level = level;

		this.#resize();
		const resizeHandler = () => {
			this.#resize()
			this.#drawMap();
		};
		window.addEventListener("resize", resizeHandler);

		this.#createLevel();

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
			cancelAnimationFrame(this.#frame);
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
		this.#snake.push({ coordinates: head, direction: Direction.Up }); // TODO: remove the hardcoded direction

		for (const [x, y] of snake) {
			this.#map[y][x] = Tile.SnakeBody;
			this.#snake.push({ coordinates: [x, y], direction: Direction.Up }); // TODO: remove the hardcoded direction
		}
	}

	#resize() {
		for (const ctx of [this.#bgCtx, this.#fgCtx]) {
			ctx.canvas.width = 0;
			ctx.canvas.height = 0;
		}
		
		const parent = this.#bgCtx.canvas.parentElement;
		
		const parentWidth = parent?.clientWidth ?? 0;
		const parentHeight = parent?.clientHeight ?? 0;
		
		let canvasWidth = parentWidth;

		const ratio = this.#level.dimensions[0] / this.#level.dimensions[1];
		
		let canvasHeight = canvasWidth / ratio;

		if (canvasHeight > parentHeight) {
			canvasHeight = parentHeight;
			canvasWidth = canvasHeight * ratio;
		}

		for (const ctx of [this.#bgCtx, this.#fgCtx]) {
			ctx.canvas.width = canvasWidth;
			ctx.canvas.height = canvasHeight;
		}
	}

	#getRandomEmptyTile() {
		const { dimensions: [width, height] } = this.#level;
		let tile: Coordinates;

		do {
			tile = [Math.floor(Math.random() * width), Math.floor(Math.random() * height)];
		} while (this.#map[tile[1]][tile[0]] !== Tile.Empty);
		
		return tile;
	}

	#adjustCoordinates([x, y]: Coordinates, delta: number, direction: Direction) {
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

	#generateBodyShapes(snakePart: SnakePart, delta: number, cellWidth: number, cellHeight: number) {
		
		const [x, y] = this.#adjustCoordinates(snakePart.coordinates, delta, snakePart.direction);
		
		return [
			new Square(x * cellWidth, y * cellHeight, "green", cellWidth)
		];
	}
	
	#generateHeadShapes(snakePart: SnakePart, delta: number, cellWidth: number, cellHeight: number) {
		
		const [x, y] = this.#adjustCoordinates(snakePart.coordinates, delta, snakePart.direction);

		return [
			new Circle(x * cellWidth, y * cellHeight, "green", cellWidth / 2),
			new Circle(x * cellWidth + cellWidth / 1.5, y * cellHeight + cellHeight / 4, "red", cellWidth / 7),
			new Circle(x * cellWidth + cellWidth / 4.5, y * cellHeight + cellHeight / 4, "red", cellWidth / 7)
		];
	}

	#write(text: string) {
		const middleX = this.#bgCtx.canvas.width / 2;
		const middleY = this.#bgCtx.canvas.height / 2;
		const fontSize = 100;
		const RGBValue = "255";
		const alpha = .5;
		
		this.#bgCtx.fillStyle = `rgba(${RGBValue}, ${RGBValue}, ${RGBValue}, ${alpha})`;
		this.#bgCtx.font = `bold ${fontSize}px 'Inter', 'Open Sans', sans-serif`;
		this.#bgCtx.textAlign = "center";
		this.#bgCtx.fillText(text, middleX, middleY + fontSize / 3);
	}

	#iterate(direction: Direction): boolean {
		const { dimensions: [width, height] } = this.#level;
		
		const [x, y] = this.#snake[0].coordinates;
		let newX = x;
		let newY = y;

		switch (direction) {
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
				throw new Error(`Unknown direction ${direction}`);
		}
		
		if (newX < 0 || newX >= width || newY < 0 || newY >= height) {
			this.#cleanup();
			return false;
		}

		let tile = this.#map[newY][newX];
		
		if (tile === Tile.Wall) {
			this.#cleanup();
			return false;
		}

		let tail: SnakePart | undefined;
		if (tile === Tile.Food) {
			this.#score++;
			const newFood = this.#getRandomEmptyTile();
			this.#map[newFood[1]][newFood[0]] = Tile.Food;
		} else {
			tail = this.#snake.pop()!;
			this.#map[tail.coordinates[1]][tail.coordinates[0]] = Tile.Empty;
		}

		tile = this.#map[newY][newX];

		if (tile === Tile.SnakeBody) {
			if (tail) {
				this.#snake.push(tail);
				this.#map[tail.coordinates[1]][tail.coordinates[0]] = Tile.SnakeBody;
			}
			this.#cleanup();
			return false;
		}

		this.#map[y][x] = Tile.SnakeBody;
		this.#map[newY][newX] = Tile.SnakeHead;
		
		this.#snake.unshift({
			coordinates: [newX, newY],
			direction
		});

		if (this.#map[newY][newX] !== Tile.SnakeHead) {
			throw new Error("The snake's head is not where it should be");
		}

		return true;
	}

	#drawMap(delta: number = 0) {
		const { dimensions: [width, height] } = this.#level;

		const cellWidth = this.#bgCtx.canvas.width / width;
		const cellHeight = this.#bgCtx.canvas.height / height;
		
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {

				const cell = this.#map[y][x];
				
				const color = (x + y) % 2 === 0 ? "#494351" : "#443e4c";
				new Square(x * cellWidth, y * cellHeight, color, cellWidth).draw(this.#bgCtx);

				switch (cell) {
					case Tile.Wall:
						new Square(x * cellWidth, y * cellHeight, "gray", cellWidth).draw(this.#bgCtx);
						break;

					case Tile.Food:
						new Circle(x * cellWidth, y * cellHeight, "red", cellWidth / 2).draw(this.#fgCtx);
						break;

					case Tile.SnakeBody:
						const snakeBody = this.#snake.find(part => part.coordinates[0] === x && part.coordinates[1] === y);
						if (!snakeBody) {
							throw new Error("Snake part not found");
						}
						for (const s of this.#generateBodyShapes(snakeBody, delta, cellWidth, cellHeight)) {
							s.draw(this.#fgCtx);
						}
						break;

					case Tile.SnakeHead:
						const snakeHead = this.#snake[0];
						if (!snakeHead) {
							throw new Error("Snake part not found");
						}
						for (const s of this.#generateHeadShapes(snakeHead, delta, cellWidth, cellHeight)) {
							s.draw(this.#fgCtx);
						}
						break;
				}
			}
		}

		this.#write(this.#score.toString());
	}
	
	#render(time: DOMHighResTimeStamp) {
		console.log("render");
		
		this.#now = time;
		this.#elapsed += this.#now - (this.#then ?? 0);
		
		const direction = this.#direction;
		
		for (const ctx of [this.#bgCtx, this.#fgCtx]) {
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		}

		// advancement pourcentage of the frame (between 0 and 1)
		const delta = Math.min(1, this.#elapsed / this.#level.delay) - 1;
		
		this.#drawMap(delta);

		let gameOver = false;
		
		if (this.#elapsed >= this.#level.delay) {
			
			if (this.#then === undefined) {
				console.log("First render");
			} else if (this.#elapsed > this.#level.delay + 30) {
				console.warn(`Game loop is taking too long, skipping ${Math.round(this.#elapsed - this.#level.delay)}ms`);
			} else {
				console.log(`Time elapsed ${Math.round(this.#elapsed)}ms`);
			}

			this.#elapsed = 0;
			this.#treated = true;
			
			gameOver = !this.#iterate(direction);
		}

		this.#then = this.#now;
		
		if (!gameOver) {
			this.#frame = requestAnimationFrame(time => this.#render(time));
		}
	}

	run() {
		requestAnimationFrame(time => this.#render(time));
	}

}