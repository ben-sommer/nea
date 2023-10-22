"use client";

import { Game } from "@/definitions/game";
import { BoardState, Square } from "@/types/game";
import { useEffect } from "react";
import { useSnapshot } from "valtio";

const ColumnLabels = () => {
    return (
        <div className="flex">
            <div className="w-9 h-9 border border-transparent font-semibold p-1 text-center"></div>
            {Array(8)
                .fill(null)
                .map((_, i) => (
                    <div
                        key={i}
                        className="w-10 h-9 border border-transparent font-semibold p-1 text-center select-none"
                    >
                        {String.fromCharCode(i + 65)}
                    </div>
                ))}
        </div>
    );
};

export const RowLabel = ({ rowIndex }: { rowIndex: number }) => {
    return (
        <div className="w-9 h-10 flex justify-center items-center border border-transparent font-semibold p-1 text-center select-none">
            {rowIndex + 1}
        </div>
    );
};

const Counter = ({ color }: { color: Square }) => {
    return (
        <div
            className={`w-full h-full rounded-full ${
                color == null
                    ? "hidden"
                    : color == "white"
                    ? "bg-white"
                    : color == "black"
                    ? "bg-black"
                    : "bg-blue-600"
            }`}
        ></div>
    );
};

const Scores = ({ game }: { game: Game }) => {
    return (
        <div className="flex w-full items-center justify-between px-9 mb-4 font-medium">
            <div
                className={`flex items-center gap-2 border-2 p-1 rounded-lg ${
                    game.turn == "black"
                        ? "border-indigo-500"
                        : "border-transparent"
                }`}
            >
                <div className="w-6 h-6 border border-black shadow-md rounded-full">
                    <Counter color="black" />
                </div>
                <p>{game.scores.black}</p>
                <p>{game.blackName}</p>
            </div>
            <div
                className={`flex items-center gap-2 border-2 p-1 rounded-lg ${
                    game.turn == "white"
                        ? "border-indigo-500"
                        : "border-transparent"
                }`}
            >
                <div className="w-6 h-6 border border-gray-400 shadow-md rounded-full">
                    <Counter color="white" />
                </div>
                <p>{game.scores.white}</p>
                <p>{game.whiteName}</p>
            </div>
        </div>
    );
};

export default function Board({ game }: { game: Game }) {
    useEffect(() => {
        // @ts-ignore
        window.game = game;
    }, [game]);

    const snap = useSnapshot(game);

    return (
        <div className="inline-block">
            <Scores game={game} />
            <ColumnLabels />
            {Array(8)
                .fill(null)
                .map((_, rowIndex) => (
                    <div key={rowIndex} className="flex">
                        <RowLabel rowIndex={7 - rowIndex} />
                        {Array(8)
                            .fill(null)
                            .map((_, columnIndex) => (
                                <div
                                    key={`${rowIndex}-${columnIndex}`}
                                    className={`w-10 h-10 border border-gray-500 p-1 ${
                                        snap.board[columnIndex][
                                            7 - rowIndex
                                        ] === null
                                            ? "cursor-pointer"
                                            : ""
                                    }`}
                                    style={{
                                        backgroundColor: "#CDCDCD",
                                    }}
                                    onClick={(_) =>
                                        game.handleSquareClick(
                                            columnIndex,
                                            7 - rowIndex
                                        )
                                    }
                                >
                                    <Counter
                                        color={
                                            snap.board[columnIndex][
                                                7 - rowIndex
                                            ]
                                        }
                                    />
                                </div>
                            ))}
                        <RowLabel rowIndex={7 - rowIndex} />
                    </div>
                ))}
            <ColumnLabels />
        </div>
    );
}
