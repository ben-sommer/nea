"use client";

import Board from "@/components/Board";
import { GameVsAI } from "@/definitions/gameVsAI";
import { useEffect, useState } from "react";
import { proxy } from "valtio";

export default function PlayerVsAI() {
    const [difficulty, setDifficulty] = useState(1);

    const [game, setGame] = useState<GameVsAI | null>(null);

    useEffect(() => {
        setGame(proxy(new GameVsAI(null, "black", difficulty)));
    }, [difficulty]);

    return (
        game && (
            <div className="flex flex-col gap-4 items-center">
                <button
                    onClick={() => game.reset()}
                    className="px-4 py-2 rounded-md border border-gray-300 bg-white shadow-md text-sm font-medium outline-none focus:ring-2 ring-indigo-500"
                >
                    Reset
                </button>
                <Board
                    game={game}
                    completionButtonOnClick={() => game.reset()}
                    completionButtonText="Start a new game"
                    hintLevel={0}
                />
                <select
                    className="px-4 py-2 rounded-md border border-gray-300 bg-white shadow-md text-sm font-medium outline-none focus:ring-2 ring-indigo-500 cursor-pointer"
                    onChange={(e) => setDifficulty(parseInt(e.target.value))}
                >
                    <option value={1}>Easy</option>
                    <option value={2}>Medium</option>
                    <option value={3}>Hard</option>
                </select>
            </div>
        )
    );
}
