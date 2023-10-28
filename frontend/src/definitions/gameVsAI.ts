import { BoardState } from "@/types/game";
import { Game } from "./game";

const staticEvaluation = (board: BoardState) => {
    const game = new Game();

    // Clone the board input which is passed by reference
    game.board = board.map((row) => row.slice()).slice();

    return game.scores.black - game.scores.white;
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
            return false;
        }

        console.log(bestMoves);

        const bestMove = bestMoves.moves[0];

        this.performMove(bestMove[0], bestMove[1]);

        this.turn = this.otherPlayer;
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
}
