export class SnakeSprite {
    #image;
    #width;
    #height;
    constructor(image, width, height) {
        this.#image = image;
        this.#width = width;
        this.#height = height;
    }
    static async load(fileName, width, height = width) {
        const image = new Image();
        image.src = `assets/images/${fileName}`;
        await image.decode();
        return new this(image, width, height);
    }
    #findSprite(type) {
        /*
            the sprite sheet is 6x4 :
            
            0  1  2  3  4  5
            6  7  8  9  10 11
            12 13 14 15 16 17
            18 19 20 21 22 23
        */
        const x = type % 6;
        const y = Math.floor(type / 6);
        return { x, y };
    }
    drawSprite(ctx, type, config) {
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
