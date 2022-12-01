import { Shape } from "./Shape.js";
export class Circle extends Shape {
    #radius;
    constructor(x, y, color, radius) {
        super(x, y, color);
        this.#radius = Math.floor(radius);
    }
    update(velocity, max) {
        this.x += velocity;
        if (this.x > max) {
            this.x = 50;
        }
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.#radius, this.y + this.#radius, this.#radius, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }
}
