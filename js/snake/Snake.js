import { Direction, SnakePartType, SnakeSpriteType } from "../types/game.js";
export class Snake {
    static #isBuilding = false;
    static #parts = [];
    #coordinates;
    #direction;
    constructor(coordinates, direction) {
        if (!Snake.#isBuilding) {
            throw new Error("Snake can only be built using the addPart method");
        }
        this.#coordinates = coordinates;
        this.#direction = direction;
    }
    get coordinates() {
        return this.#coordinates;
    }
    get direction() {
        return this.#direction;
    }
    static reset() {
        this.#parts = [];
    }
    static getHead() {
        return this.#parts[0];
    }
    static removeLast() {
        return this.#parts.pop(); // TODO: remove bangs in whole project
    }
    static addPart(coordinates, direction, unshift = false) {
        Snake.#isBuilding = true;
        const part = new this(coordinates, direction);
        Snake.#isBuilding = false;
        return unshift
            ? this.#parts.unshift(part)
            : this.#parts.push(part);
    }
    static findPart([x, y]) {
        return this.#parts.find(part => part.coordinates[0] === x && part.coordinates[1] === y);
    }
    #getType() {
        switch (Snake.#parts.indexOf(this)) {
            case 0:
                return SnakePartType.Head;
            case Snake.#parts.length - 1:
                return SnakePartType.Tail;
            default:
                return SnakePartType.Body;
        }
    }
    #adjustCoordinates([x, y], delta, direction) {
        switch (direction) {
            case Direction.Up:
                y -= delta;
                break;
            case Direction.Right:
                x += delta;
                break;
            case Direction.Down:
                y += delta;
                break;
            case Direction.Left:
                x -= delta;
                break;
            default:
                throw new Error(`Unknown direction ${direction}`);
        }
        return [x, y];
    }
    #drawPart(ctx, sprite, x, y, width, height, partType, dead) {
        let spriteType;
        if (partType === SnakePartType.Head) {
            switch (this.#direction) {
                case Direction.Up:
                    spriteType = dead ? SnakeSpriteType.HeadDeadUp : SnakeSpriteType.HeadUp;
                    break;
                case Direction.Right:
                    spriteType = dead ? SnakeSpriteType.HeadDeadRight : SnakeSpriteType.HeadRight;
                    break;
                case Direction.Down:
                    spriteType = dead ? SnakeSpriteType.HeadDeadDown : SnakeSpriteType.HeadDown;
                    break;
                case Direction.Left:
                    spriteType = dead ? SnakeSpriteType.HeadDeadLeft : SnakeSpriteType.HeadLeft;
                    break;
                default:
                    throw new Error(`Unknown direction: ${this.#direction}`);
            }
        }
        else if (partType === SnakePartType.Body) {
            const previousDirection = this.#getPreviousPart().direction;
            if ((previousDirection === Direction.Up && this.#direction === Direction.Up) || (previousDirection === Direction.Down && this.#direction === Direction.Down)) {
                spriteType = SnakeSpriteType.BodyVertical;
            }
            else if ((previousDirection === Direction.Left && this.#direction === Direction.Left) || (previousDirection === Direction.Right && this.#direction === Direction.Right)) {
                spriteType = SnakeSpriteType.BodyHorizontal;
            }
            else if ((previousDirection === Direction.Up && this.#direction === Direction.Right) || (previousDirection === Direction.Left && this.#direction === Direction.Down)) {
                spriteType = SnakeSpriteType.BodyTopLeft;
            }
            else if ((previousDirection === Direction.Up && this.#direction === Direction.Left) || (previousDirection === Direction.Right && this.#direction === Direction.Down)) {
                spriteType = SnakeSpriteType.BodyTopRight;
            }
            else if ((previousDirection === Direction.Down && this.#direction === Direction.Left) || (previousDirection === Direction.Right && this.#direction === Direction.Up)) {
                spriteType = SnakeSpriteType.BodyBottomRight;
            }
            else if ((previousDirection === Direction.Down && this.#direction === Direction.Right) || (previousDirection === Direction.Left && this.#direction === Direction.Up)) {
                spriteType = SnakeSpriteType.BodyBottomLeft;
            }
            else {
                throw new Error(`Unknown corner directions: ${previousDirection} and ${this.#direction}`);
            }
        }
        else if (partType === SnakePartType.Tail) {
            const previousDirection = this.#getPreviousPart().#direction; // weird but i'll see when i implement corners
            switch (previousDirection) {
                case Direction.Up:
                    spriteType = SnakeSpriteType.TailDown;
                    break;
                case Direction.Right:
                    spriteType = SnakeSpriteType.TailLeft;
                    break;
                case Direction.Down:
                    spriteType = SnakeSpriteType.TailUp;
                    break;
                case Direction.Left:
                    spriteType = SnakeSpriteType.TailRight;
                    break;
                default:
                    throw new Error(`Unknown direction: ${previousDirection}`);
            }
        }
        else {
            throw new Error(`Unknown snake part type: ${partType}`);
        }
        sprite.drawSprite(ctx, spriteType, { x, y, width, height });
    }
    #getPreviousPart() {
        return Snake.#parts[Snake.#parts.indexOf(this) - 1];
    }
    draw(ctx, sprite, width, height, delta, dead) {
        let [x, y] = this.#adjustCoordinates(this.#coordinates, delta, this.#direction);
        x = x * width;
        y = y * height;
        this.#drawPart(ctx, sprite, x, y, width, height, this.#getType(), dead);
    }
}
