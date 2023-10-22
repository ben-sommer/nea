"use client";

import Board from "@/components/Board";
import { Game } from "@/definitions/game";
import { useState } from "react";
import { proxy } from "valtio";

export default function PlayerVsAI() {
    const game = proxy(new Game());

    game.blackName = "You";
    game.whiteName = "AI";

    return (
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
            />
        </div>
    );
}
