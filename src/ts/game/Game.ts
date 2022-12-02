import { Snake } from "../snake/Snake.js";
import { Square } from "../shapes/index.js";
import { EventConfig } from "../types/event.js";
import { Coordinates, defaultGameSettings, Direction, GameMap, GameSettings, LevelFile, SnakeSpriteType, Tile } from "../types/game.js";
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
	#goal: number = 0;
	#score: number = 0;
	#sprite: SnakeSprite;
	#settings: GameSettings = defaultGameSettings;

	#direction: Direction = Direction.Up;
	#treated: boolean = true;

	#gameEvents: EventConfig[] = []; // need to be removed after leaving the game
	#levelEvents: EventConfig[] = []; // need to be removed after the level stops
	
	onGameReady: () => void;
	onGameWin: () => void;
	onGameOver: (score: number, goal: number) => void;
	
	private constructor(level: LevelFile, sprite: SnakeSprite, onGameReady: () => void, onGameWin: () => void, onGameOver: (score: number, goal: number) => void) {
		if (!Game.#isBuilding) {
			throw new Error("Game can only be built using the builder method");
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
		
		this.#bgCtx = bgCtx;
		this.#fgCtx = fgCtx;

		this.#level = level;
		this.#sprite = sprite;
		this.onGameReady = onGameReady;
		this.onGameWin = onGameWin;
		this.onGameOver = onGameOver;

		this.#resize();
		const resizeHandler = () => {
			this.#resize();
			this.#drawMap();
		};
		
		this.#init();
		
		this.#addEventListener("game", {
			target: window,
			type: "resize",
			handler: resizeHandler
		});

		this.onGameReady();
	}

	static async builder(levelId: number, onGameReady: () => void, onGameWin: () => void, onGameOver: (score: number, goal: number) => void) {
		Game.#isBuilding = true;
		try {
			const promises = await Promise.all([
				SnakeSprite.load("sprite-sheet.png", 64),
				fetch(`../../assets/levels/level-${levelId}.json`)
			]);

			const [sprite, res] = promises;
			
			if (!res.ok) {
				throw new Error(`Couldn't load level ${levelId}`);
			}
			
			const level: LevelFile = await res.json();
			
			return new this(level, sprite, onGameReady, onGameWin, onGameOver);
		} catch (e) {
			console.error(e);
			throw new Error(`Couldn't build the level ${levelId}`, { cause: e });
		} finally {
			Game.#isBuilding = false;
		}
	}

	#init() {
		this.#createLevel();
		this.#drawMap();
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

		if (headX === tailX) {
			if (headY < tailY) {
				this.#direction = Direction.Up;
			} else {
				this.#direction = Direction.Down;
			}
		} else if (headY === tailY) {
			if (headX < tailX) {
				this.#direction = Direction.Left;
			} else {
				this.#direction = Direction.Right;
			}
		} else {
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

		this.#goal = this.#map.flat().filter(tile => tile === Tile.Empty).length;

		this.#generateFood();
		
	}

	#resize() {
		for (const { canvas } of [this.#bgCtx, this.#fgCtx]) {
			canvas.width = 0;
			canvas.height = 0;
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

		for (const { canvas } of [this.#bgCtx, this.#fgCtx]) {
			canvas.width = canvasWidth;
			canvas.height = canvasHeight;
		}
	}

	#loadSettings() {
		const settings = localStorage.getItem("settings");

		if (settings) {
			try {
				const parsed = JSON.parse(settings);
				this.#settings = parsed;
			} catch (e) {
				console.error(e);
				console.error("Error while parsing settings");
			}
		}
	}

	#addEventListener(scope: "game" | "level", config: EventConfig) {
		config.target.addEventListener(config.type, config.handler);
		if (scope === "game") {
			this.#gameEvents.push(config);
		} else {
			this.#levelEvents.push(config);
		}
	}
	
	#addDirectionEvent() {
		const keydownHandler = (e: Event) => {
			if (this.#treated === false || !(e instanceof KeyboardEvent)) {
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
			if (newDirection && Math.abs(newDirection) !== Math.abs(this.#direction)) {
				this.#direction = newDirection;
				this.#treated = false;
			}
		};

		this.#addEventListener("level", {
			target: window,
			type: "keydown",
			handler: keydownHandler
		});
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
		const alpha = .75;
		
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
			this.#gameFinished();
			return false;
		}

		let tile = this.#map[newY][newX];
		
		if (tile === Tile.Wall) {
			this.#gameFinished();
			return false;
		}

		let tail: Snake | undefined;
		if (tile === Tile.Food) {
			this.#score++;
			if (this.#score >= this.#goal) {
				this.#gameFinished(true);
				return false;
			}
			this.#generateFood();
		} else {
			tail = Snake.removeLast();
			this.#map[tail.coordinates[1]][tail.coordinates[0]] = Tile.Empty;
		}

		tile = this.#map[newY][newX];
		
		if (tile === Tile.SnakeBody) {
			if (tail) {
				Snake.addPart(tail.coordinates, tail.direction);
				this.#map[tail.coordinates[1]][tail.coordinates[0]] = Tile.SnakeBody;
			}
			this.#gameFinished();
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

	#drawMap(delta: number = 0, iterating: boolean = true, dead: boolean = false) {
		const { dimensions: [width, height] } = this.#level;
		
		const cellWidth = this.#bgCtx.canvas.width / width;
		const cellHeight = this.#bgCtx.canvas.height / height;
		
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				
				const cell = this.#map[y][x];
				
				if (iterating) {
					const color = (x + y) % 2 === 0 ? "hsl(266deg, 9%, 29%)" : "hsl(266deg, 10%, 27%)";
					new Square(x * cellWidth, y * cellHeight, color, cellWidth).draw(this.#bgCtx);
				}

				switch (cell) {
					case Tile.Wall:
						if (iterating) {
							this.#sprite.drawSprite(this.#bgCtx, SnakeSpriteType.Wall, {
								x: x * cellWidth,
								y: y * cellHeight,
								width: cellWidth,
								height: cellHeight
							});
						}
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

						part.draw(this.#fgCtx, this.#sprite, cellWidth, cellHeight, delta, dead);
						break;
				}
			}
		}

		if (iterating) {
			this.#write(this.#score.toString());
		}
	}
	
	#render(time: DOMHighResTimeStamp) {
		console.info("render");
		
		this.#now = time;
		this.#elapsed += this.#now - (this.#then ?? 0);
		
		const iterating = this.#then === undefined || this.#elapsed >= this.#level.delay;
		
		if (iterating) {
			this.#bgCtx.clearRect(0, 0, this.#bgCtx.canvas.width, this.#bgCtx.canvas.height);
		}
		this.#fgCtx.clearRect(0, 0, this.#fgCtx.canvas.width, this.#fgCtx.canvas.height);

		let delta;
		if (this.#settings?.smoothMovement) {
			delta = Math.min(1, this.#elapsed / this.#level.delay) - 1;
		} else {
			delta = 0;
		}
		
		this.#drawMap(delta, iterating);

		let gameFinished = false;
		
		if (iterating) {
			
			if (this.#then === undefined) {
				console.info("First render");
			} else if (this.#elapsed > this.#level.delay + 30) {
				console.warn(`Game loop is taking too long, skipping ${Math.round(this.#elapsed - this.#level.delay)}ms`);
			} else {
				console.info(`Iterating, last iteration was ${Math.round(this.#elapsed)}ms ago`);
			}

			this.#elapsed = 0;
			this.#treated = true;
			
			gameFinished = !this.#iterate(this.#direction);
		}

		this.#then = this.#now;
		
		if (!gameFinished) {
			this.#frame = requestAnimationFrame(time => this.#render(time));
		}
	}

	#gameFinished(wonGame: boolean = false) {
		for (const { target, type, handler } of this.#levelEvents) {
			target.removeEventListener(type, handler);
		}
		this.#levelEvents = [];

		if (this.#frame) {
			cancelAnimationFrame(this.#frame);
		}
		
		if (wonGame) {
			this.onGameWin();
		} else {
			this.#drawMap(0, false, true);
			this.onGameOver(this.#score, this.#goal);
		}
	}

	close() {
		for (const { target, type, handler } of [...this.#gameEvents, ...this.#levelEvents]) {
			target.removeEventListener(type, handler);
		}
		this.#gameEvents = [];
		this.#levelEvents = [];
		if (this.#frame) {
			cancelAnimationFrame(this.#frame);
		}
		Snake.reset();
	}
	
	restart() {
		Snake.reset();
		this.#score = 0;
		this.#then = undefined;
		this.#now = undefined;
		this.#elapsed = 0;
		this.#treated = true;
		this.#init();
		this.run();
	}
	
	run() {
		this.#loadSettings();
		this.#addDirectionEvent();
		requestAnimationFrame(time => this.#render(time));
	}

}