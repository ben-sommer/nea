"use client";

import { Game } from "@/definitions/game";
import { OnlineGame } from "@/definitions/onlineGame";
import { BoardState, Square } from "@/types/game";
import { useEffect, useState } from "react";
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

const Counter = ({
    color,
    hint,
    hintLevel,
    lastMove = false,
}: {
    color: Square;
    hint?: number;
    hintLevel?: number;
    lastMove?: boolean;
}) => {
    // Hint level:
    // 0 - off
    // 1 - show valid moves
    // 2 - show valid moves and number of counters flipped

    return (
        <div
            className={`w-full h-full rounded-full flex items-center justify-center ${
                color == null
                    ? hint && hintLevel != 0 && hint > 0
                        ? "border-blue-600 border-2 bg-[#CDCDCD]"
                        : "hidden"
                    : color == "white"
                    ? "bg-white"
                    : "bg-black"
            }`}
        >
            {!!hint && hint > 0 && hintLevel == 2 && <p>{hint}</p>}
            {lastMove && (
                <div className="invert mix-blend-difference font-semibold bg-black rounded-full w-2 h-2 opacity-90"></div>
            )}
        </div>
    );
};

const Scores = ({ game }: { game: OnlineGame | Game }) => {
    const snap = useSnapshot(game);

    return (
        <div className="flex w-full items-center justify-between px-9 mb-4 font-medium">
            <div
                className={`flex items-center gap-2 border-2 p-1 rounded-lg ${
                    snap.turn == "black"
                        ? "border-indigo-500"
                        : "border-transparent"
                }`}
            >
                <div className="w-6 h-6 border border-black shadow-md rounded-full">
                    <Counter color="black" />
                </div>
                <p>{snap.scores.black}</p>
                <p>{snap.blackName}</p>
            </div>
            <div
                className={`flex flex-row-reverse items-center gap-2 border-2 p-1 rounded-lg ${
                    snap.turn == "white"
                        ? "border-indigo-500"
                        : "border-transparent"
                }`}
            >
                <div className="w-6 h-6 border border-gray-400 shadow-md rounded-full">
                    <Counter color="white" />
                </div>
                <p>{snap.scores.white}</p>
                <p>{snap.whiteName}</p>
            </div>
        </div>
    );
};

export default function Board({
    game,
    completionButtonText,
    completionButtonOnClick,
    self,
    hintLevel = 0,
}: {
    game: OnlineGame | Game;
    completionButtonText: string;
    completionButtonOnClick: () => void;
    self?: any;
    hintLevel?: number;
}) {
    useEffect(() => {
        // @ts-ignore
        window.game = game;
    }, [game]);

    const snap = useSnapshot(game);

    return (
        <div className="relative">
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
                                        className={`w-10 h-10 border ${
                                            snap.finished ? "opacity-50" : ""
                                        } border-gray-500 p-1 ${
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
                                            !game.handleSquareClick(
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
                                            hint={
                                                snap.checkMove(
                                                    columnIndex,
                                                    7 - rowIndex
                                                ).length
                                            }
                                            hintLevel={hintLevel}
                                            lastMove={
                                                game.lastMove
                                                    ? game.lastMove[0] ==
                                                          columnIndex &&
                                                      game.lastMove[1] ==
                                                          7 - rowIndex
                                                    : false
                                            }
                                        />
                                    </div>
                                ))}
                            <RowLabel rowIndex={7 - rowIndex} />
                        </div>
                    ))}
                <ColumnLabels />
            </div>
            {(snap.finished || snap.forfeitedBy) && (
                <div className="absolute top-0 text-center w-full mt-[12.5rem]">
                    <p className="font-semibold bg-white flex flex-col w-64 mx-auto gap-2 rounded-md border-gray-300 border shadow-md px-4 py-2">
                        <span className="text-2xl">
                            {snap.forfeitedBy && self
                                ? `${
                                      snap.forfeitedBy == self.username
                                          ? "You"
                                          : snap.forfeitedBy
                                  } forfeited`
                                : snap.winner == "draw"
                                ? "Draw"
                                : `${
                                      snap.getNameFromColor(snap.winner) ==
                                      "You"
                                          ? "You win"
                                          : `${snap.getNameFromColor(
                                                snap.winner
                                            )} wins!`
                                  }`}
                        </span>
                        <span
                            onClick={completionButtonOnClick}
                            className="px-4 py-2 rounded-md text-white bg-indigo-500 shadow-md text-sm font-medium outline-none cursor-pointer"
                        >
                            {completionButtonText}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}
