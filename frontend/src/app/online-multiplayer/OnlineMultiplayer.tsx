"use client";

import Board from "@/components/Board";
import { Game } from "@/definitions/game";
import { useEffect, useState } from "react";
import { proxy } from "valtio";
import useWebSocket, { ReadyState } from "react-use-websocket";
import SignIn from "@/components/SignIn";
import { Player } from "@/types/player";
import { useCookies } from "react-cookie";

export default function OnlineMultiplayer() {
    const [signedIn, setSignedIn] = useState(true);
    const [players, setPlayers] = useState<Player[]>([]);

    const [cookies, setCookie, removeCookie] = useCookies(["token"]);

    const { sendMessage, readyState } = useWebSocket(
        "ws://localhost:3010/multiplayer",
        {
            onMessage: (message) => {
                try {
                    const parsedMessage = JSON.parse(message.data);

                    const instruction = parsedMessage[0];
                    const body = parsedMessage[1] || {};

                    console.log({
                        instruction,
                        body,
                    });

                    switch (instruction) {
                        case "error:token":
                            setSignedIn(false);
                            break;
                        case "user:players":
                            setPlayers(body);
                            break;
                    }
                } catch (e: any) {
                    console.log(e.message);
                }
            },
        }
    );

    const game = proxy(new Game());

    return (
        <div className="flex flex-col gap-4 items-center">
            {signedIn ? (
                <>
                    {readyState == ReadyState.CLOSED ||
                    readyState == ReadyState.CLOSING ? (
                        <p>Connection lost - please try again</p>
                    ) : readyState == ReadyState.CONNECTING ? (
                        <p>Connecting to server - please wait</p>
                    ) : readyState == ReadyState.UNINSTANTIATED ? (
                        <p>An internal error occurred - please try again</p>
                    ) : (
                        <div className="flex flex-col gap-2 items-center">
                            <button
                                onClick={() => {
                                    removeCookie("token");
                                    setSignedIn(false);
                                }}
                                className="px-4 py-2 rounded-md border border-gray-300 bg-white shadow-md text-sm font-medium outline-none focus:ring-2 ring-indigo-500"
                            >
                                Log Out
                            </button>
                            <p>Online players ({players.length}):</p>
                            <div>
                                {players.map((player) => (
                                    <p key={player.username}>
                                        {player.firstName} {player.lastName} (
                                        {player.username})
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <SignIn
                    onSuccess={(token) => {
                        setSignedIn(true);
                        sendMessage(JSON.stringify(["refresh:token", token]));
                    }}
                />
            )}
        </div>
    );
}
