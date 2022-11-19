import { Square, Circle } from "../shapes/index.js";
import { Coordinates, Direction, GameMap, LevelFile, Tile } from "../types/game.js";
import { create2DArray } from "../utils/array.js";

export class Snake {
	
	static #isBuilding: boolean = false;
	
	#bgCtx: CanvasRenderingContext2D;
	#fgCtx: CanvasRenderingContext2D;

	#level: LevelFile;
	
	#frame?: number;
	#then?: DOMHighResTimeStamp;
	#now?: DOMHighResTimeStamp;

	#map: GameMap = [];
	#snake: Coordinates[] = [];
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
		this.#snake.push(head);

		for (const [x, y] of snake) {
			this.#map[y][x] = Tile.SnakeBody;
			this.#snake.push([x, y]);
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

		this.#drawMap();
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

	#iterate(): boolean {
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
			return false;
		}

		let tile = this.#map[newY][newX];
		
		if (tile === Tile.Wall) {
			this.#cleanup();
			return false;
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
			return false;
		}

		this.#map[y][x] = Tile.SnakeBody;
		this.#map[newY][newX] = Tile.SnakeHead;
		
		this.#snake.unshift([newX, newY]);

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
						new Square(x * cellWidth, y * cellHeight, "green", cellWidth).draw(this.#fgCtx);
						break;

					case Tile.SnakeHead:
						new Circle(x * cellWidth, y * cellHeight, "green", cellWidth / 2).draw(this.#fgCtx);
						new Circle(x * cellWidth + cellWidth / 1.5, y * cellHeight + cellHeight / 4, "red", cellWidth / 7).draw(this.#fgCtx);
						new Circle(x * cellWidth + cellWidth / 4.5, y * cellHeight + cellHeight / 4, "red", cellWidth / 7).draw(this.#fgCtx);
						break;
				}
			}
		}

		this.#write(this.#score.toString());
	}
	
	#render(time: DOMHighResTimeStamp) {
		console.log("render");
		
		this.#now = time;

		const elapsed = this.#now - (this.#then ?? 0);
		
		let gameOver = false;
		
		if (elapsed >= this.#level.speed) {
			
			if (this.#then === undefined) {
				console.log("First render");
			} else if (elapsed > this.#level.speed + 30) {
				console.warn(`Game loop is taking too long, skipping ${elapsed - this.#level.speed}ms`);
			} else {
				console.log("Time elapsed", elapsed);
			}
			
			const delta = (this.#now - (this.#then ?? 0)) / 1000;
			
			for (const ctx of [this.#bgCtx, this.#fgCtx]) {
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			}
			
			this.#drawMap(delta);
			
			gameOver = !this.#iterate();

			this.#then = this.#now;
		}

		if (!gameOver) {
			this.#frame = requestAnimationFrame(time => this.#render(time));
		}
	}

	run() {
		requestAnimationFrame(time => this.#render(time));
	}

}