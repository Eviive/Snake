import { SnakeSpriteType } from "../types/game.js";
import { SpriteConfig, SpriteCoordinates, SpriteHandler } from "../types/sprite.js";

export class SnakeSprite implements SpriteHandler<SnakeSpriteType> {

	#image: HTMLImageElement;
	#width: number;
	#height: number;
	
	constructor(image: HTMLImageElement, width: number, height: number) {
		this.#image = image;
		this.#width = width;
		this.#height = height;
	}

	static async load(fileName: string, width: number, height: number = width): Promise<SnakeSprite> {
		const image = new Image();
		
		image.src = `assets/images/${fileName}`;
		
		await image.decode();

		return new this(image, width, height);
	}

	#findSprite(type: SnakeSpriteType): SpriteCoordinates {
		/*
			the sprite sheet is 5x4 :
			
			0  1  2  3  4
			5  6  7  8  9
			10 11 12 13 14
			15 16 17 18 19
		*/
		const x = type % 5;
		const y = Math.floor(type / 5);
		
		return { x, y };
	}

	drawSprite(ctx: CanvasRenderingContext2D, type: SnakeSpriteType, config: SpriteConfig): void {

		let { x: sourceX, y: sourceY } = this.#findSprite(type);
		
		sourceX = sourceX * this.#width;
		sourceY = sourceY * this.#height;
		
		let { x, y, width = this.#width, height = this.#height, scale } = config;
		
		if (scale) {
			const ogWidth = width;
			const ogHeight = height;
			width *= scale;
			height *= scale;
			x -= (width - ogWidth) / 2;
			y -= (height - ogHeight) / 2;
		}
		
		ctx.drawImage(this.#image, sourceX, sourceY, this.#width, this.#height, Math.floor(x), Math.floor(y), Math.ceil(width), Math.ceil(height));
	}

}