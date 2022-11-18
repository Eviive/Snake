export type Coordinates = [number, number];

export interface LevelFile {
	dimensions: Coordinates;
	speed: number; // pixels per second
	walls: Coordinates[];
	food: Coordinates[];
	snake: Coordinates[];
};