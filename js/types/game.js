export var Tile;
(function (Tile) {
    Tile[Tile["Empty"] = 0] = "Empty";
    Tile[Tile["Wall"] = 1] = "Wall";
    Tile[Tile["Food"] = 2] = "Food";
    Tile[Tile["SnakeBody"] = 3] = "SnakeBody";
    Tile[Tile["SnakeHead"] = 4] = "SnakeHead";
})(Tile || (Tile = {}));
export var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 1] = "Up";
    Direction[Direction["Right"] = 2] = "Right";
    Direction[Direction["Down"] = -1] = "Down";
    Direction[Direction["Left"] = -2] = "Left";
})(Direction || (Direction = {}));
/*
    the sprite sheet is 6x4 :
    
    0  1  2  3  4  5
    6  7  8  9  10 11
    12 13 14 15 16 17
    18 19 20 21 22 23
*/
export var SnakeSpriteType;
(function (SnakeSpriteType) {
    SnakeSpriteType[SnakeSpriteType["HeadUp"] = 3] = "HeadUp";
    SnakeSpriteType[SnakeSpriteType["HeadRight"] = 4] = "HeadRight";
    SnakeSpriteType[SnakeSpriteType["HeadDown"] = 10] = "HeadDown";
    SnakeSpriteType[SnakeSpriteType["HeadLeft"] = 9] = "HeadLeft";
    SnakeSpriteType[SnakeSpriteType["HeadDeadUp"] = 5] = "HeadDeadUp";
    SnakeSpriteType[SnakeSpriteType["HeadDeadRight"] = 17] = "HeadDeadRight";
    SnakeSpriteType[SnakeSpriteType["HeadDeadDown"] = 11] = "HeadDeadDown";
    SnakeSpriteType[SnakeSpriteType["HeadDeadLeft"] = 23] = "HeadDeadLeft";
    SnakeSpriteType[SnakeSpriteType["BodyVertical"] = 8] = "BodyVertical";
    SnakeSpriteType[SnakeSpriteType["BodyHorizontal"] = 1] = "BodyHorizontal";
    SnakeSpriteType[SnakeSpriteType["BodyTopLeft"] = 14] = "BodyTopLeft";
    SnakeSpriteType[SnakeSpriteType["BodyTopRight"] = 6] = "BodyTopRight";
    SnakeSpriteType[SnakeSpriteType["BodyBottomLeft"] = 2] = "BodyBottomLeft";
    SnakeSpriteType[SnakeSpriteType["BodyBottomRight"] = 0] = "BodyBottomRight";
    SnakeSpriteType[SnakeSpriteType["TailUp"] = 22] = "TailUp";
    SnakeSpriteType[SnakeSpriteType["TailRight"] = 21] = "TailRight";
    SnakeSpriteType[SnakeSpriteType["TailDown"] = 15] = "TailDown";
    SnakeSpriteType[SnakeSpriteType["TailLeft"] = 16] = "TailLeft";
    SnakeSpriteType[SnakeSpriteType["Food"] = 18] = "Food";
    SnakeSpriteType[SnakeSpriteType["Wall"] = 20] = "Wall";
})(SnakeSpriteType || (SnakeSpriteType = {}));
export var SnakePartType;
(function (SnakePartType) {
    SnakePartType[SnakePartType["Head"] = 0] = "Head";
    SnakePartType[SnakePartType["Body"] = 1] = "Body";
    SnakePartType[SnakePartType["Tail"] = 2] = "Tail";
})(SnakePartType || (SnakePartType = {}));
export const defaultGameSettings = {
    smoothMovement: false
};
