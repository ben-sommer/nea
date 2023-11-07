export type Square = null | "black" | "white";

export type BoardState = Square[][];

// Key used to reference game class instance on server
export type ServerGame = {
    black: string;
    white: string;
};
