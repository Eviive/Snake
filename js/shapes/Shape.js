export class Shape {
    #x;
    #y;
    #color;
    constructor(x, y, color) {
        this.#x = Math.floor(x);
        this.#y = Math.floor(y);
        this.#color = color;
    }
    get x() {
        return this.#x;
    }
    set x(x) {
        this.#x = x;
    }
    get y() {
        return this.#y;
    }
    set y(y) {
        this.#y = y;
    }
    get color() {
        return this.#color;
    }
    set color(color) {
        this.#color = color;
    }
}
