export type Square = null | "black" | "white";

export type BoardState = Square[][];

export type ServerGame = {
    black: string;
    white: string;
};
