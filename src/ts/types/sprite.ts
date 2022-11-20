export type SpriteCoordinates = {
	x: number;
	y: number;
}

export interface SpriteConfig {
	x: number;
	y: number;
	width?: number;
	height?: number;
	scale?: number;
}

export interface SpriteHandler<E> {
	drawSprite(ctx: CanvasRenderingContext2D, element: E, config: SpriteConfig): void;
}