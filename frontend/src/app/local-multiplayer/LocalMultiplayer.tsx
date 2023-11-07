"use client";

import Board from "@/components/Board";
import { Game } from "@/definitions/game";
import { useEffect, useState } from "react";
import { proxy } from "valtio";

export default function LocalMultiplayer() {
    // 0 - No hints
    // 1 - Basic hints (possible moves)
    // 2 - Advanced hints (possible moves and number flipped)
    const [hintLevel, setHintLevel] = useState(0);

    const [game, setGame] = useState<Game | null>(null);

    useEffect(() => {
        setGame(proxy(new Game()));
    }, []);

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
                    hintLevel={hintLevel}
                />
                <select
                    className="px-4 py-2 rounded-md border border-gray-300 bg-white shadow-md text-sm font-medium outline-none focus:ring-2 ring-indigo-500 cursor-pointer"
                    onChange={(e) => setHintLevel(parseInt(e.target.value))}
                >
                    <option value={0}>No hints</option>
                    <option value={1}>Basic hints</option>
                    <option value={2}>Advanced hints</option>
                </select>
            </div>
        )
    );
}
