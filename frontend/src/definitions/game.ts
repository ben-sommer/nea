import { BoardState } from "@/types/game";

export class Game {
    board: BoardState;
    turn: "black" | "white";
    blackName: string;
    whiteName: string;

    constructor() {
        const board: BoardState = Array(8)
            .fill(null)
            .map((_) => Array(8).fill(null));

        board[3][3] = "black";
        board[3][4] = "white";
        board[4][3] = "white";
        board[4][4] = "black";

        this.board = board;
        this.turn = "black";
        this.blackName = "Black";
        this.whiteName = "White";
    }

    get scores() {
        const addReduce = (
            array: any[],
            condition: (item: any) => number
        ): any[] =>
            array.reduce(
                (previous, current) => previous + (condition(current) || 0),
                0
            );

        return {
            black: addReduce(
                this.board.map((line) =>
                    addReduce(line, (item) => (item == "black" ? 1 : 0))
                ),
                (item) => item
            ),
            white: addReduce(
                this.board.map((line) =>
                    addReduce(line, (item) => (item == "white" ? 1 : 0))
                ),
                (item) => item
            ),
        };
    }

    get otherPlayer() {
        if (this.turn == "black") {
            return "white";
        } else {
            return "black";
        }
    }

    handleSquareClick(x: number, y: number) {
        if (this.board[x][y] === null) {
            this.board[x][y] = this.turn;
            this.turn = this.otherPlayer;
        } else {
            return false;
        }
    }
}
