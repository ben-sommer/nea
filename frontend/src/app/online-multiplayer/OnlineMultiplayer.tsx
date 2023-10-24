"use client";

import Board from "@/components/Board";
import { Game } from "@/definitions/game";
import { useEffect, useState } from "react";
import { proxy } from "valtio";
import useWebSocket, { ReadyState } from "react-use-websocket";
import SignIn from "@/components/SignIn";

export default function OnlineMultiplayer() {
    const [signedIn, setSignedIn] = useState(true);

    const { sendMessage, lastMessage, readyState } = useWebSocket(
        "ws://localhost:3010/multiplayer",
        {
            onMessage: (message) => {
                const parsedMessage = JSON.parse(message.data);

                const instruction = parsedMessage[0];
                const body = parsedMessage[1] || {};

                switch (instruction) {
                    case "auth:expired":
                        setSignedIn(false);
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
                        <div>
                            <p>Online players:</p>
                        </div>
                    )}
                </>
            ) : (
                <SignIn
                    onSuccess={() => {
                        setSignedIn(true);
                    }}
                />
            )}
        </div>
    );
}
