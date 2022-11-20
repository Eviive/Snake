export type Coordinates = [number, number];

export interface LevelFile {
	dimensions: Coordinates;
	delay: number;
	direction: Direction;
	walls: Coordinates[];
	snake: Coordinates[];
}

export type GameMap = number[][];

export enum Tile {
	Empty = 0,
	Wall = 1,
	Food = 2,
	SnakeBody = 3,
	SnakeHead = 4
}

export enum Direction {
	Up = 1,
	Right = 2,
	Down = -1,
	Left = -2
}

/*
	the sprite sheet is 5x4 :
	
	0  1  2  3  4
	5  6  7  8  9
	10 11 12 13 14
	15 16 17 18 19
*/
export enum SnakeSpriteType {
	HeadUp = 3,
	HeadRight = 4,
	HeadDown = 9,
	HeadLeft = 8,
	BodyVertical = 7,
	BodyHorizontal = 1,
	BodyTopLeft = 12,
	BodyTopRight = 5,
	BodyBottomLeft = 2,
	BodyBottomRight = 0,
	TailUp = 19,
	TailRight = 18,
	TailDown = 13,
	TailLeft = 14,
	Food = 15
}

export enum SnakePartType {
	Head = 0,
	Body = 1,
	Tail = 2
}