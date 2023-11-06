import { sqlFromFile } from "../utils/database";
import { jsToSqlDate } from "../utils/date";
import { Client } from "./client";
import { Game } from "./game";
import { v4 as uuid } from "uuid";

export class OnlineGame extends Game {
    black: Client | null;
    white: Client | null;
    spectators: Client[];
    forfeited: boolean;
    documented: boolean;

    constructor(clients: Client[]) {
        super();

        if (clients.length != 2) {
            throw new Error("Must have exactly 2 clients");
        }

        const blackIndex = Math.floor(Math.random() * 2);
        const whiteIndex = 1 - blackIndex;

        this.spectators = [];

        this.black = clients[blackIndex];
        this.white = clients[whiteIndex];
        this.blackName = this.black.username;
        this.whiteName = this.white.username;
        this.forfeited = false;
        this.documented = false;

        this.broadcastGame();

        console.log("before", clients);

        for (const client of this.clients) {
            this.bindListeners(client);

            // Remove invite map flags
            client.invitedBy[
                client.username == this.blackName
                    ? this.whiteName
                    : this.blackName
            ] = false;
            client.sentInvites[
                client.username == this.blackName
                    ? this.whiteName
                    : this.blackName
            ] = false;
        }

        this.black.multiplayer.broadcastPlayers();
    }

    get clients() {
        return [
            ...(this.black ? [this.black] : []),
            ...(this.white ? [this.white] : []),
        ];
    }

    bindListeners(client: Client) {
        client.connection.on("message", async (message) => {
            const parsedMessage = JSON.parse(message.toString());

            const instruction = parsedMessage[0];
            const body = parsedMessage[1] || {};

            if (!this.finished) {
                switch (instruction) {
                    case "game:move":
                        if (
                            client.username ==
                            (this.turn == "black"
                                ? this.blackName
                                : this.whiteName)
                        ) {
                            const normal = this.handleSquareClick(
                                body.x,
                                body.y
                            );

                            if (!normal) {
                                this.sendAll("game:over");
                                this.clients[0].multiplayer.removeGame(
                                    this.black,
                                    this.white
                                );
                                this.clients[0].multiplayer.broadcastGames();

                                // Ensure leaderboard is only updated once
                                if (!this.documented) {
                                    this.documented = true;

                                    for (const client of this.clients) {
                                        await client.multiplayer.db.run(
                                            await sqlFromFile(
                                                "update",
                                                "CreateGame"
                                            ),
                                            {
                                                ":id": uuid(),
                                                ":user": client.username,
                                                ":outcome":
                                                    this.winner == "draw"
                                                        ? "draw"
                                                        : this.getNameFromColor(
                                                              this.winner
                                                          ) == client.username
                                                        ? "win"
                                                        : "loss",
                                                ":completedAt": jsToSqlDate(
                                                    new Date()
                                                ),
                                            }
                                        );
                                    }
                                }
                            }
                        } else {
                            client.send("game:move:error", "Not your turn");
                        }

                        this.broadcastGame();

                        break;
                    case "game:forfeit":
                        if (!this.isGameOver && !this.forfeited) {
                            this.sendAll("game:forfeited", client.username);
                            this.clients[0].multiplayer.removeGame(
                                this.black,
                                this.white
                            );
                            this.clients[0].multiplayer.broadcastPlayers();
                            this.clients[0].multiplayer.broadcastGames();

                            // Ensure leaderboard is only updated once
                            if (!this.documented) {
                                this.documented = true;

                                const forfeitedBy = client.username;

                                for (const client of this.clients) {
                                    await client.multiplayer.db.run(
                                        await sqlFromFile(
                                            "update",
                                            "CreateGame"
                                        ),
                                        {
                                            ":id": uuid(),
                                            ":user": client.username,
                                            ":outcome":
                                                forfeitedBy == client.username
                                                    ? "loss"
                                                    : "win",
                                            ":completedAt": jsToSqlDate(
                                                new Date()
                                            ),
                                        }
                                    );
                                }
                            }
                        }
                        break;
                }
            }
        });
    }

    // Send message to both players
    sendAll(event: string, body?: any) {
        for (const client of [...this.clients, ...this.spectators]) {
            client.send(event, typeof body == "function" ? body(client) : body);
        }
    }

    broadcastGame() {
        this.sendAll("game:state", (client: Client) => ({
            ...this.serializeState(),
            self: client.serialize(),
        }));
    }

    // Detailed game state for spectators and players
    serializeState() {
        return {
            turn: this.turn,
            board: this.board,
            whiteName: this.whiteName,
            blackName: this.blackName,
            finished: this.finished,
        };
    }

    // Summary game state for others
    serialize() {
        return {
            black: this.blackName,
            white: this.whiteName,
        };
    }

    reconnect(client: Client) {
        if (client.username == this.blackName && this.white) {
            this.black = client;
        } else if (client.username == this.whiteName && this.black) {
            this.white = client;
        } else {
            return false;
        }

        this.bindListeners(client);
        this.broadcastGame();
    }
}
