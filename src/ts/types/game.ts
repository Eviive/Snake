export type Coordinates = [number, number];

export interface LevelFile {
	dimensions: Coordinates;
	delay: number;
	walls: Coordinates[];
	food: Coordinates[];
	snake: Coordinates[];
};