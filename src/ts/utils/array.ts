export const create2DArray = <T>(width: number, height: number, value: T): T[][] => {
	const array = new Array(height);
	
	for (let i = 0; i < height; i++) {
		array[i] = new Array(width).fill(value);
	}

	return array;
}