import { Client } from "./client";
import { Game } from "./game";

export class OnlineGame extends Game {
    black: Client | null;
    white: Client | null;
    clients: Client[];
    forfeited: boolean;

    constructor(clients: Client[]) {
        super();

        if (clients.length != 2) {
            throw new Error("Must have exactly 2 clients");
        }

        const blackIndex = Math.floor(Math.random() * 2);
        const whiteIndex = 1 - blackIndex;

        this.black = clients[blackIndex];
        this.white = clients[whiteIndex];
        this.blackName = this.black.username;
        this.whiteName = this.white.username;
        this.forfeited = false;

        this.clients = [this.black, this.white];

        this.broadcastGame();

        console.log("before", clients);

        for (const client of this.clients) {
            this.bindListeners(client);

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

        console.log("after", clients);
    }

    bindListeners(client: Client) {
        client.connection.on("message", (message) => {
            const parsedMessage = JSON.parse(message.toString());

            const instruction = parsedMessage[0];
            const body = parsedMessage[1] || {};

            switch (instruction) {
                case "game:move":
                    if (
                        client.username ==
                        (this.turn == "black" ? this.blackName : this.whiteName)
                    ) {
                        const normal = this.handleSquareClick(body.x, body.y);

                        if (!normal) {
                            this.sendAll("game:over");
                            this.clients[0].multiplayer.removeGame(
                                this.black,
                                this.white
                            );
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
                    }
                    break;
            }
        });
    }

    sendAll(event: string, body?: any) {
        for (const client of this.clients) {
            client.send(event, typeof body == "function" ? body(client) : body);
        }
    }

    broadcastGame() {
        this.sendAll("game:state", (client: Client) => ({
            ...this.serializeState(),
            self: client.multiplayer.serializeClient(client),
        }));
    }

    serializeState() {
        return {
            turn: this.turn,
            board: this.board,
            whiteName: this.whiteName,
            blackName: this.blackName,
            finished: this.finished,
        };
    }

    reconnect(client: Client) {
        if (client.username == this.blackName && this.white) {
            this.clients = [client, this.white];
            this.black = client;
        } else if (client.username == this.whiteName && this.black) {
            this.clients = [this.black, client];
            this.white = client;
        } else {
            return false;
        }

        this.bindListeners(client);
        this.broadcastGame();
    }
}
