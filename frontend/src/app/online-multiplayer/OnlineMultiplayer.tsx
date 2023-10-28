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
import { OnlineGame } from "@/definitions/onlineGame";

export default function OnlineMultiplayer() {
    const [signedIn, setSignedIn] = useState(true);
    const [signInError, setSignInError] = useState("");
    const [players, setPlayers] = useState<Player[]>([]);
    const [self, setSelf] = useState<Player | null>(null);
    const [inGame, setInGame] = useState(false);
    const [invitedBy, setInvitedBy] = useState<{ [username: string]: boolean }>(
        {}
    );
    const [sentInvites, setSentInvites] = useState<{
        [username: string]: boolean;
    }>({});

    const [cookies, setCookie, removeCookie] = useCookies(["token"]);

    const didUnmount = useRef(false);

    const [game, setGame] = useState<OnlineGame | null>(null);

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
                            setInvitedBy(body.invitedBy);
                            setSentInvites(body.sentInvites);
                            break;
                        case "info:players":
                            setInvitedBy(
                                body.find(
                                    (player: any) =>
                                        player.username == self?.username
                                )?.invitedBy || {}
                            );
                            setSentInvites(
                                body.find(
                                    (player: any) =>
                                        player.username == self?.username
                                )?.sentInvites || {}
                            );
                            setPlayers(body);
                            break;
                        case "game:send-invite:error":
                            toast.error(
                                <span>
                                    Error inviting <b>{body}</b> to a game
                                </span>
                            );
                            break;
                        case "game:send-invite:success":
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
                        case "game:state":
                            {
                                const game = new OnlineGame(sendMessage);
                                setSelf(body.self);

                                game.board = body.board;
                                game.finished = body.finished;
                                game.blackName =
                                    body.blackName == body.self.username
                                        ? "You"
                                        : body.blackName;
                                game.whiteName = body.whiteName =
                                    body.whiteName == body.self.username
                                        ? "You"
                                        : body.whiteName;
                                game.turn = body.turn;

                                setGame(proxy(game));
                                setInGame(true);
                            }
                            break;
                        case "game:move:error":
                            toast.error(body || "Error making move");
                            break;
                        case "game:forfeited":
                            if (game) {
                                const newGame = new OnlineGame(sendMessage);
                                newGame.forfeitedBy = body;
                                newGame.board = game.board;
                                newGame.finished = true;
                                newGame.blackName = game.blackName;
                                newGame.whiteName = game.whiteName;
                                newGame.turn = game.turn;

                                setGame(proxy(newGame));
                            }
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
                            {inGame && !game?.finished && (
                                <button
                                    onClick={() => {
                                        sendMessage(
                                            JSON.stringify(["game:forfeit"])
                                        );
                                    }}
                                    className="px-4 py-2 rounded-md border border-gray-300 bg-white shadow-md text-sm font-medium outline-none focus:ring-2 ring-indigo-500"
                                >
                                    Forfeit
                                </button>
                            )}
                            {inGame && game ? (
                                <Board
                                    game={game}
                                    completionButtonText={"Back to player list"}
                                    completionButtonOnClick={() =>
                                        setInGame(false)
                                    }
                                    self={self}
                                />
                            ) : (
                                <>
                                    <p>Online players ({players.length}):</p>
                                    <PlayerList
                                        onInvite={onInvite}
                                        onAccept={onAccept}
                                        players={players}
                                        self={self}
                                        invitedBy={invitedBy}
                                        sentInvites={sentInvites}
                                    />
                                </>
                            )}
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
