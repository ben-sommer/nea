"use client";

import Board from "@/components/Board";
import { Game } from "@/definitions/game";
import { useEffect, useRef, useState } from "react";
import { proxy } from "valtio";
import useWebSocket, { ReadyState } from "react-use-websocket";
import SignIn from "@/components/SignIn";
import { Player } from "@/types/player";
import { useCookies } from "react-cookie";
import PlayerList from "@/components/PlayerList";
import toast from "react-hot-toast";
import { IoInformationCircle } from "react-icons/io5";

export default function OnlineMultiplayer() {
    const [signedIn, setSignedIn] = useState(true);
    const [signInError, setSignInError] = useState("");
    const [players, setPlayers] = useState<Player[]>([]);
    const [self, setSelf] = useState<Player | null>(null);
    const [invitedBy, setInvitedBy] = useState<{ [username: string]: boolean }>(
        {}
    );
    const [sentInvites, setSentInvites] = useState<{
        [username: string]: boolean;
    }>({});

    const [cookies, setCookie, removeCookie] = useCookies(["token"]);

    const didUnmount = useRef(false);

    const { sendMessage, readyState } = useWebSocket(
        "ws://localhost:3010/multiplayer",
        {
            reconnectInterval: (attemptNumber) => {
                return Math.min(Math.pow(2, attemptNumber) * 1000, 10000);
            },
            shouldReconnect: (event) => {
                return didUnmount.current == false;
            },
            onOpen: () => {
                const token = cookies.token;

                if (token) {
                    sendMessage(JSON.stringify(["auth:login", token]));
                } else {
                    setSignedIn(false);
                }
            },
            onMessage: (message) => {
                try {
                    const parsedMessage = JSON.parse(message.data);

                    const instruction = parsedMessage[0];
                    const body = parsedMessage[1] || "";

                    console.log({
                        instruction,
                        body,
                    });

                    switch (instruction) {
                        case "auth:login:error":
                            setSignedIn(false);
                            setSignInError(body);
                            break;
                        case "auth:login:success":
                            setSignedIn(true);
                            setSelf(body);
                            break;
                        case "info:players":
                            setPlayers(body);
                            break;
                        case "game:send-invite:error":
                            toast.error(
                                <span>
                                    Error inviting <b>{body}</b> to a game
                                </span>
                            );
                            break;
                        case "game:invited":
                            toast(
                                <span>
                                    <b>{body}</b> invited you to a game
                                </span>,
                                {
                                    icon: (
                                        <IoInformationCircle className="min-h-[26px] min-w-[26px] mt-[2px] -mr-[4px] -ml-[2px] align-middle text-indigo-500" />
                                    ),
                                }
                            );

                            setInvitedBy((invitedBy) => ({
                                ...invitedBy,
                                [body]: true,
                            }));
                            break;
                    }
                } catch (e: any) {
                    console.log(e.message);
                }
            },
        }
    );

    const onInvite = (username: string) => {
        sendMessage(JSON.stringify(["game:send-invite", username]));

        setSentInvites((sentInvites) => ({
            ...sentInvites,
            [username]: true,
        }));
    };

    const onAccept = (username: string) => {
        sendMessage(JSON.stringify(["game:accept-invite", username]));
    };

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
                                    sendMessage(
                                        JSON.stringify(["auth:logout"])
                                    );
                                }}
                                className="px-4 py-2 rounded-md border border-gray-300 bg-white shadow-md text-sm font-medium outline-none focus:ring-2 ring-indigo-500"
                            >
                                Log Out
                            </button>
                            <p>Online players ({players.length}):</p>
                            <PlayerList
                                onInvite={onInvite}
                                onAccept={onAccept}
                                players={players}
                                self={self}
                                invitedBy={invitedBy}
                                sentInvites={sentInvites}
                            />
                        </div>
                    )}
                </>
            ) : (
                <SignIn
                    onSuccess={(token) => {
                        sendMessage(JSON.stringify(["auth:login", token]));
                    }}
                    signInError={signInError}
                />
            )}
        </div>
    );
}
