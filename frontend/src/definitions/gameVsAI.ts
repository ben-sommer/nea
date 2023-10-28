import { BoardState } from "@/types/game";
import { Game } from "./game";

const weightMatrix = [
    [10, 7, 4, 4, 4, 4, 7, 10],
    [7, 7, 0, 0, 0, 0, 7, 7],
    [4, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 4],
    [4, 0, 0, 0, 0, 0, 0, 4],
    [7, 7, 0, 0, 0, 0, 7, 7],
    [10, 7, 4, 4, 4, 4, 7, 10],
];

const frontierDiscWeight = 1;
const interiorDiscWeight = 3;
const winGameWeight = 10000;

const computeWeights = (board: BoardState, color: "black" | "white") => {
    let total = 0;

    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (board[x][y] === color) {
                total += weightMatrix[x][y];
            }
        }
    }

    return total;
};

const countDiscTypes = (board: BoardState, color: "black" | "white") => {
    let frontierDiscs = 0;
    let interiorDiscs = 0;

    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            if (board[x][y] === color) {
                let isFrontier = false;

                // Name loop so can break out of nested loop easily
                checkLoop: for (let xDir = -1; xDir < 2; xDir++) {
                    for (let yDir = -1; yDir < 2; yDir++) {
                        // Check target piece is in the board
                        if (
                            !(xDir == 0 && yDir == 0) &&
                            !(
                                x + xDir > 7 ||
                                x + xDir < 0 ||
                                y + yDir > 7 ||
                                y + yDir < 0
                            )
                        ) {
                            if (board[x + xDir][y + yDir] === null) {
                                isFrontier = true;
                                break checkLoop;
                            }
                        }
                    }
                }

                if (isFrontier) {
                    frontierDiscs++;
                } else {
                    interiorDiscs++;
                }
            }
        }
    }

    return (
        frontierDiscs * frontierDiscWeight + interiorDiscs * interiorDiscWeight
    );
};

const staticEvaluation = (board: BoardState) => {
    const game = new Game();

    // Clone the board input which is passed by reference
    game.board = board.map((row) => row.slice()).slice();

    const blackScore =
        computeWeights(game.board, "black") +
        countDiscTypes(game.board, "black");
    const whiteScore =
        computeWeights(game.board, "white") +
        countDiscTypes(game.board, "white");

    // Zero for draw
    const winWeight = game.isGameOver
        ? game.winner == "black"
            ? winGameWeight
            : game.winner == "white"
            ? -winGameWeight
            : 0
        : 0;

    return blackScore - whiteScore + winWeight;
};

const isGameOver = (board: BoardState) => {
    const game = new Game();

    // Clone the board input which is passed by reference
    game.board = board.map((row) => row.slice()).slice();

    return game.isGameOver;
};

const getPossibleMoves = (board: BoardState, turn: "black" | "white") => {
    const game = new Game();

    // Clone the board input which is passed by reference
    game.board = board.map((row) => row.slice()).slice();
    game.turn = `${turn}`;

    return game.possibleMoves;
};

const performMove = (
    board: BoardState,
    turn: "black" | "white",
    x: number,
    y: number
) => {
    const game = new Game();

    // Clone the board input which is passed by reference
    game.board = board.map((row) => row.slice()).slice();
    game.turn = `${turn}`;

    game.performMove(x, y);

    return game.board;
};

class ScoredMoves {
    moves: number[][];
    score: number;

    constructor(moves: number[][], score: number) {
        this.moves = moves;
        this.score = score;
    }
}

export class GameVsAI extends Game {
    constructor(
        initialState: BoardState | null = null,
        turn: "black" | "white" = "black"
    ) {
        super();

        if (initialState) this.board = initialState;
        if (turn) this.turn = turn;

        this.blackName = "You";
        this.whiteName = "AI";
    }

    minimax(
        board: BoardState,
        moves: number[][],
        depth: number,
        alpha: ScoredMoves,
        beta: ScoredMoves,
        isMaximising: boolean
    ): ScoredMoves {
        if (depth == 0 || isGameOver(board)) {
            return new ScoredMoves(moves, staticEvaluation(board));
        } else if (isMaximising) {
            let value = new ScoredMoves([], -Infinity);

            for (const move of getPossibleMoves(board, "black")) {
                const newBoard = performMove(board, "black", move[0], move[1]);

                const next = this.minimax(
                    newBoard,
                    [...moves, move],
                    depth - 1,
                    alpha,
                    beta,
                    false
                );

                if (value.score < next.score) {
                    value = next;
                }

                if (value.score > beta.score) {
                    break;
                }

                if (value.score > alpha.score) {
                    alpha = value;
                }
            }

            return value;
        } else {
            let value = new ScoredMoves([], Infinity);

            for (const move of getPossibleMoves(board, "white")) {
                const newBoard = performMove(board, "white", move[0], move[1]);

                const next = this.minimax(
                    newBoard,
                    [...moves, move],
                    depth - 1,
                    alpha,
                    beta,
                    true
                );

                if (value.score > next.score) {
                    value = next;
                }

                if (value.score < alpha.score) {
                    break;
                }

                if (value.score < beta.score) {
                    beta = value;
                }
            }

            return value;
        }
    }

    makeAIMove() {
        const bestMoves = this.minimax(
            this.board,
            [],
            5,
            new ScoredMoves([], -Infinity),
            new ScoredMoves([], Infinity),
            false
        );

        if (!bestMoves.moves.length) {
            console.log("No moves for AI");
            this.turn = this.otherPlayer;
            if (!this.anyMovesLeft) {
                this.finished = true;
            }
            return false;
        }

        console.log(bestMoves);

        const bestMove = bestMoves.moves[0];

        this.performMove(bestMove[0], bestMove[1]);

        this.turn = this.otherPlayer;

        if (!this.anyMovesLeft) {
            this.turn = this.otherPlayer;
            this.makeAIMove();
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

        this.board[x][y] = this.turn;

        this.turn = this.otherPlayer;
        this.makeAIMove();

        if (this.isGameOver) {
            return false;
        }

        if (!this.anyMovesLeft) {
            // No moves available for opponent, so play reverts to previous player
            console.log("NO MOVES, REVERTED");

            this.turn = this.otherPlayer;
            this.makeAIMove();
        }

        return true;
    }

    reset() {
        this.board = this.initialBoard;
        this.turn = "black";
        this.blackName = "You";
        this.whiteName = "AI";
        this.finished = false;
    }
}
