"use client";

import Board from "@/components/Board";
import { Game } from "@/definitions/game";
import { useState } from "react";
import { proxy } from "valtio";

export default function LocalMultiplayer() {
    const game = proxy(new Game());

    return <Board game={game} />;
}
