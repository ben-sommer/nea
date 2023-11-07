"use client";

import Board from "@/components/Board";
import { useRef, useState } from "react";
import { proxy } from "valtio";
import useWebSocket, { ReadyState } from "react-use-websocket";
import SignIn from "@/components/SignIn";
import { Player } from "@/types/player";
import { useCookies } from "react-cookie";
import PlayerList from "@/components/PlayerList";
import toast from "react-hot-toast";
import { IoInformationCircle } from "react-icons/io5";
import { OnlineGame } from "@/definitions/onlineGame";
import { ServerGame } from "@/types/game";
import GameList from "@/components/GameList";
import Leaderboard from "@/components/Leaderboard";

export default function OnlineMultiplayer() {
    const [signedIn, setSignedIn] = useState(true);
    const [signInError, setSignInError] = useState("");

    const [players, setPlayers] = useState<Player[]>([]);
    const [self, setSelf] = useState<Player | null>(null);

    // Whether the user is in an active game or not
    const [inGame, setInGame] = useState(false);

    // Invite maps
    const [invitedBy, setInvitedBy] = useState<{ [username: string]: boolean }>(
        {}
    );
    const [sentInvites, setSentInvites] = useState<{
        [username: string]: boolean;
    }>({});

    // Token is stored in cookie so user doesn't have to log in each time
    const [cookies, setCookie, removeCookie] = useCookies(["token"]);

    // Used to check whether to reconnect after user clicks away from tab and returns
    const didUnmount = useRef(false);

    // Current game
    const [game, setGame] = useState<OnlineGame | null>(null);

    // All active games
    const [games, setGames] = useState<any[]>([]);

    const { sendMessage, readyState } = useWebSocket(
        process.env.NEXT_PUBLIC_WS_ADDRESS as string,
        {
            reconnectInterval: (attemptNumber) => {
                // Exponential backoff to decrease number of unsuccessful reconnection attempts
                return Math.min(Math.pow(2, attemptNumber) * 1000, 10000);
            },
            shouldReconnect: (event) => {
                // Only reconnect if the online multiplayer mode is active
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
                        case "info:games":
                            setGames(body);

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
                            // Scoped to avoid issues redeclaring game constant
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

                                // React handles state differently to vanilla js so proxy is needed for stateful class instance
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

                                // React handles state differently to vanilla js so proxy is needed for stateful class instance
                                setGame(proxy(newGame));
                            }

                            break;
                    }
                } catch (e: any) {
                    toast.error(e.message || "An error occurred");
                }
            },
        }
    );

    const onInvite = (username: string) => {
        sendMessage(JSON.stringify(["game:send-invite", username]));

        // Update local invite map
        setSentInvites((sentInvites) => ({
            ...sentInvites,
            [username]: true,
        }));
    };

    const onAccept = (username: string) => {
        sendMessage(JSON.stringify(["game:accept-invite", username]));
    };

    const onSpectate = (game: ServerGame) => {
        sendMessage(JSON.stringify(["game:spectate", game]));
    };

    return (
        <div className="flex flex-col gap-4 items-center mb-4">
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
                                <>
                                    {game?.blackName == "You" ||
                                    game?.whiteName == "You" ? (
                                        <button
                                            onClick={() => {
                                                sendMessage(
                                                    JSON.stringify([
                                                        "game:forfeit",
                                                    ])
                                                );
                                            }}
                                            className="px-4 py-2 rounded-md border border-gray-300 bg-white shadow-md text-sm font-medium outline-none focus:ring-2 ring-indigo-500"
                                        >
                                            Forfeit
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (game) {
                                                    sendMessage(
                                                        JSON.stringify([
                                                            "game:spectate-stop",
                                                            {
                                                                black: game.blackName,
                                                                white: game.whiteName,
                                                            },
                                                        ])
                                                    );
                                                    setGame(null);
                                                    setInGame(false);
                                                }
                                            }}
                                            className="px-4 py-2 rounded-md border border-gray-300 bg-white shadow-md text-sm font-medium outline-none focus:ring-2 ring-indigo-500"
                                        >
                                            Stop Spectating
                                        </button>
                                    )}
                                </>
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
                                    <p className="mt-8">
                                        Active games ({games.length}):
                                    </p>
                                    <GameList
                                        games={games}
                                        onSpectate={onSpectate}
                                    />
                                    <p className="font-semibold">Leaderboard</p>
                                    <Leaderboard />
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
