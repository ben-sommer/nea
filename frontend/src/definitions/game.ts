import { BoardState } from "../types/game";

export class Game {
    board: BoardState;
    turn: "black" | "white";
    blackName: string;
    whiteName: string;
    finished: boolean;
    forfeitedBy: string | null;
    lastMove: [number, number] | null;

    constructor() {
        this.board = this.initialBoard;
        this.turn = "black";
        this.blackName = "Black";
        this.whiteName = "White";
        this.finished = false;
        this.forfeitedBy = null;
        this.lastMove = null;
    }

    get initialBoard() {
        // Empty 8x8 2D-array
        const board: BoardState = Array(8)
            .fill(null)
            .map((_) => Array(8).fill(null));

        // Place initial 4 counters
        board[3][3] = "black";
        board[3][4] = "white";
        board[4][3] = "white";
        board[4][4] = "black";

        return board;
    }

    get scores() {
        // Generate sum from array of values of any type via custom checker function
        const addReduce = (
            array: any[],
            getNum: (item: any) => number
        ): number =>
            array.reduce(
                (previous, current) => previous + (getNum(current) || 0),
                0
            );

        // Summate 8x8 2-D array into 1-D array and then again into a single number for both colours
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

            this.board[x][y] = this.turn;

            this.lastMove = [x, y];

            return flippedSquares.length;
        }
    }

    checkMove(x: number, y: number) {
        if (this.board[x][y] !== null) {
            return [];
        }

        // Recursive function to check for valid runs
        const ray = (
            x: number,
            y: number,
            xDir: number,
            yDir: number,
            squares: [number, number][]
        ): [number, number][] => {
            if (x + xDir > 7 || x + xDir < 0 || y + yDir > 7 || y + yDir < 0) {
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
                    // Add counters to be flipped from this run to array
                    squares = [...squares, ...ray(x, y, xDir, yDir, [])];
                }
            }
        }

        // Return comprehensive list of squares where counters need to be flipped
        return squares;
    }

    get winner() {
        if (this.scores.black > this.scores.white) {
            return "black";
        } else if (this.scores.black < this.scores.white) {
            return "white";
        } else {
            return "draw";
        }
    }

    get possibleMoves() {
        let moves = [];

        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                if (this.checkMove(x, y).length > 0) {
                    moves.push([x, y]);
                }
            }
        }

        return moves;
    }

    // More time efficient version of the above function
    // Not needed to identify exact moves, only presence of one
    get anyMovesLeft() {
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                if (this.checkMove(x, y).length > 0) {
                    return true;
                }
            }
        }

        return false;
    }

    getNameFromColor(color: "black" | "white") {
        return color == "black" ? this.blackName : this.whiteName;
    }

    get isGameOver() {
        if (this.anyMovesLeft) {
            return false;
        }

        // Check if any moves left for opponent
        this.turn = this.otherPlayer;

        const opponentMovesLeft = this.anyMovesLeft;

        this.turn = this.otherPlayer;

        if (opponentMovesLeft) {
            // Current player skips turn as cannot go - opponent has possible moves
            return false;
        } else {
            this.finished = true;

            // Neither player can place any more counters so W/D/L state is declared
            return this.winner;
        }
    }

    handleSquareClick(x: number, y: number) {
        // Return values:
        // true - no further action needed
        // false - game is over

        if (this.isGameOver) {
            return false;
        }

        const flippedSquares = this.performMove(x, y);

        if (flippedSquares == 0) {
            return true;
        }

        this.turn = this.otherPlayer;

        if (this.isGameOver) {
            return false;
        }

        if (!this.anyMovesLeft) {
            // No moves available for opponent, so play reverts to previous player

            this.turn = this.otherPlayer;
        }

        return true;
    }

    reset() {
        this.board = this.initialBoard;
        this.turn = "black";
        this.blackName = "Black";
        this.whiteName = "White";
        this.finished = false;
    }
}
