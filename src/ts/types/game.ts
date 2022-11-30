export type Coordinates = [number, number];

export interface LevelFile {
	dimensions: Coordinates;
	delay: number;
	goal: number;
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
	the sprite sheet is 6x4 :
	
	0  1  2  3  4  5
	6  7  8  9  10 11
	12 13 14 15 16 17
	18 19 20 21 22 23
*/
export enum SnakeSpriteType {
	HeadUp = 3,
	HeadRight = 4,
	HeadDown = 10,
	HeadLeft = 9,
	HeadDeadUp = 5,
	HeadDeadRight = 17,
	HeadDeadDown = 11,
	HeadDeadLeft = 23,
	BodyVertical = 8,
	BodyHorizontal = 1,
	BodyTopLeft = 14,
	BodyTopRight = 6,
	BodyBottomLeft = 2,
	BodyBottomRight = 0,
	TailUp = 22,
	TailRight = 21,
	TailDown = 15,
	TailLeft = 16,
	Food = 18,
	Wall = 20
}

export enum SnakePartType {
	Head = 0,
	Body = 1,
	Tail = 2
}

export interface GameSettings {
	smoothMovement?: boolean;
}

export const defaultGameSettings: GameSettings = {
	smoothMovement: false
};