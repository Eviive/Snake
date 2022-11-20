export type Coordinates = [number, number];

export interface LevelFile {
	dimensions: Coordinates;
	delay: number;
	walls: Coordinates[];
	food: Coordinates[];
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

export interface SnakePart {
	coordinates: Coordinates;
	direction: Direction;
}