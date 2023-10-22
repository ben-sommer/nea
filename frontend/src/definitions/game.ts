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

    performMove(x: number, y: number) {
        const flippedSquares = this.checkMove(x, y);

        if (flippedSquares.length == 0) {
            return 0;
        } else {
            for (const square of flippedSquares) {
                this.board[square[0]][square[1]] = this.turn;
            }

            return flippedSquares.length;
        }
    }

    checkMove(x: number, y: number) {
        if (this.board[x][y] !== null) {
            return [];
        }

        const ray = (
            x: number,
            y: number,
            xDir: number,
            yDir: number,
            squares: [number, number][]
        ): [number, number][] => {
            if (x > 7 || x < 0 || y > 7 || y < 0) {
                // Hit the edge of the board without a counter of the opponent's color to bound the run
                return [];
            }

            const square = this.board[x + xDir][y + yDir];

            if (square == null) {
                // Hit an empty square before a counter of the opponent's color, so no counters would be flipped
                return [];
            } else if (square == this.otherPlayer) {
                // Hit a square of the opponent's color so run continues
                squares.push([x + xDir, y + yDir]);
                return ray(x + xDir, y + yDir, xDir, yDir, squares);
            } else {
                // Hit a square of current player's color, ending run
                return squares;
            }
        };

        let squares: [number, number][] = [];

        for (let xDir = -1; xDir < 2; xDir++) {
            for (let yDir = -1; yDir < 2; yDir++) {
                if (!(xDir == 0 && yDir == 0)) {
                    squares = [...squares, ...ray(x, y, xDir, yDir, [])];
                }
            }
        }

        return squares;
    }

    handleSquareClick(x: number, y: number) {
        const flippedSquares = this.performMove(x, y);

        if (flippedSquares == 0) {
            return false;
        }

        this.board[x][y] = this.turn;
        this.turn = this.otherPlayer;

        return true;
    }
}
