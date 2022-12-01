export const create2DArray = (width, height, value) => {
    const array = new Array(height);
    for (let i = 0; i < height; i++) {
        array[i] = new Array(width).fill(value);
    }
    return array;
};
