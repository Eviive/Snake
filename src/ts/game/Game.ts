import { Snake } from "../snake/Snake.js";
import { Square } from "../shapes/index.js";
import { Coordinates, Direction, GameMap, LevelFile, SnakeSpriteType, Tile } from "../types/game.js";
import { create2DArray } from "../utils/array.js";
import { SnakeSprite } from "./SnakeSprite.js";

export class Game {
	
	static #isBuilding: boolean = false;
	
	#bgCtx: CanvasRenderingContext2D;
	#fgCtx: CanvasRenderingContext2D;

	#level: LevelFile;
	
	#frame?: number;
	#then?: DOMHighResTimeStamp;
	#now?: DOMHighResTimeStamp;
	#elapsed: DOMHighResTimeStamp = 0;

	#map: GameMap = [];
	#score: number = 0;
	#sprite: SnakeSprite;

	#direction: Direction;
	#treated: boolean = true;
	
	constructor(level: LevelFile, sprite: SnakeSprite) {
		if (!Game.#isBuilding) {
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
		this.#direction = level.direction;
		this.#sprite = sprite;

		this.#resize();
		const resizeHandler = () => {
			this.#resize();
			this.#drawMap();
		};
		window.addEventListener("resize", resizeHandler);

		this.#createLevel();

		const keydownHandler = (e: KeyboardEvent) => {
			if (this.#treated === false) {
				return;
			}
			let newDirection: Direction | undefined;
			switch (e.key) {
				case "ArrowUp":
				case "z":
					newDirection = Direction.Up;
					break;
				
				case "ArrowRight":
				case "d":
					newDirection = Direction.Right;
					break;

				case "ArrowDown":
				case "s":
					newDirection = Direction.Down;
					break;

				case "ArrowLeft":
				case "q":
					newDirection = Direction.Left;
					break;
			}
			if (newDirection && -newDirection !== this.#direction) {
				this.#direction = newDirection;
				this.#treated = false;
			}
		};
		window.addEventListener("keydown", keydownHandler);
	}

	static async builder(levelId: number) {
		Game.#isBuilding = true;
		try {
			const res = await Promise.all([
				SnakeSprite.load("sprite-sheet.png", 64, 64),
				import(`../../assets/levels/level-${levelId}.json`, {
					assert: { type: "json" }
				})
			]);

			const [sprite, module] = res;
			
			const level = module.default as LevelFile;
			
			return new this(level, sprite);
		} catch (e) {
			console.error(e);
			throw new Error(`Couldn't build the level ${levelId}`, { cause: e });
		} finally {
			Game.#isBuilding = false;
		}
	}
	
	#cleanup() { // TODO: do a real cleanup, remove all the events
		if (this.#frame) {
			cancelAnimationFrame(this.#frame);
		}
	}

	#createLevel() {
		const { dimensions: [width, height], walls, snake } = this.#level;
		
		this.#map = create2DArray(width, height, Tile.Empty);

		for (const [x, y] of walls) {
			if (this.#isOutOfBounds(x, y)) {
				throw new Error(`Wall at (${x}, ${y}) is out of bounds`);
			}
			this.#map[y][x] = Tile.Wall;
		}

		if (snake.length < 2) {
			throw new Error("The snake must have at least a head and a tail");
		}

		const [headX, headY] = snake[0];
		const [tailX, tailY] = snake.at(-1)!;

		if (headX !== tailX && headY !== tailY) {
			throw new Error("The snake must be in a straight line");
		}

		if (headX === tailX) {
			if (Math.abs(headY - tailY) !== snake.length - 1) {
				throw new Error("The snake must be in one piece");
			}
		} else {
			if (Math.abs(headX - tailX) !== snake.length - 1) {
				throw new Error("The snake must be in one piece");
			}
		}
		
		for (let i = 0; i < snake.length; i++) {
			const x = snake[i][0];
			const y = snake[i][1];
			
			if (this.#isOutOfBounds(x, y)) {
				throw new Error(`Snake part at (${x}, ${y}) is out of bounds`);
			}

			if (this.#map[y][x] !== Tile.Empty) {
				throw new Error(`Snake part at (${x}, ${y}) is not on an empty tile`);
			}
			
			if (i === 0) {
				this.#map[y][x] = Tile.SnakeHead;
			} else {
				this.#map[y][x] = Tile.SnakeBody;
			}
			Snake.addPart(snake[i], this.#direction);
		}

		this.#generateFood();
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

	#isOutOfBounds(x: number, y: number) {
		const { dimensions: [width, height] } = this.#level;

		return x < 0 || x >= width || y < 0 || y >= height;
	}

	#generateFood() {
		const newFood = this.#getRandomEmptyTile();
		this.#map[newFood[1]][newFood[0]] = Tile.Food;
	}

	#write(text: string) {
		const middleX = this.#bgCtx.canvas.width / 2;
		const middleY = this.#bgCtx.canvas.height / 2;
		const fontSize = this.#bgCtx.canvas.width / 7;
		const RGBValue = 255;
		const alpha = .5;
		
		this.#bgCtx.fillStyle = `rgba(${RGBValue}, ${RGBValue}, ${RGBValue}, ${alpha})`;
		this.#bgCtx.font = `bold ${fontSize}px 'Inter', 'Open Sans', sans-serif`;
		this.#bgCtx.textAlign = "center";
		this.#bgCtx.fillText(text, middleX, middleY + fontSize / 3);
	}

	#iterate(direction: Direction): boolean {
		const [x, y] = Snake.getHead().coordinates;
		
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
				throw new Error(`Unknown direction: ${direction}`);
		}
		
		if (this.#isOutOfBounds(newX, newY)) {
			this.#cleanup();
			return false;
		}

		let tile = this.#map[newY][newX];
		
		if (tile === Tile.Wall) {
			this.#cleanup();
			return false;
		}

		let tail: Snake | undefined;
		if (tile === Tile.Food) {
			this.#score++;
			this.#generateFood();
		} else {
			tail = Snake.removeLast();
			this.#map[tail.coordinates[1]][tail.coordinates[0]] = Tile.Empty;
		}

		tile = this.#map[newY][newX];

		if (tile === Tile.SnakeBody) {
			if (tail) {
				Snake.parts.push(tail); // TODO: pas de surcharge bruh
				this.#map[tail.coordinates[1]][tail.coordinates[0]] = Tile.SnakeBody;
			}
			this.#cleanup();
			return false;
		}

		this.#map[y][x] = Tile.SnakeBody;
		this.#map[newY][newX] = Tile.SnakeHead;
		
		Snake.addPart([newX, newY], direction, true);
		
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
						this.#sprite.drawSprite(this.#fgCtx, SnakeSpriteType.Food, {
							x: x * cellWidth,
							y: y * cellHeight,
							width: cellWidth,
							height: cellHeight,
							scale: 1.3
						});
						break;

					case Tile.SnakeBody:
					case Tile.SnakeHead:
						const part = Snake.findPart([x, y]);
						if (!part) {
							throw new Error("Snake part not found");
						}

						part.draw(this.#fgCtx, this.#sprite, cellWidth, cellHeight, delta);
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
				console.log(`Iterating, last iteration was ${Math.round(this.#elapsed)}ms ago`);
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