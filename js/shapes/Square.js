import { Shape } from "./Shape.js";
export class Square extends Shape {
    #size;
    constructor(x, y, color, size) {
        super(x, y, color);
        this.#size = Math.ceil(size);
    }
    update(velocity, max) {
        this.x += velocity;
        if (this.x > max) {
            this.x = 50;
        }
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.#size, this.#size);
    }
}
