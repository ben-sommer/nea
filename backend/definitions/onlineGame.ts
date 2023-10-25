import { Client } from "./client";
import { Game } from "./game";

export class OnlineGame extends Game {
    black: Client;
    white: Client;
    clients: Client[];

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

        this.clients = clients;

        this.broadcastGame();
    }

    sendAll(event: string, body?: any) {
        for (const client of this.clients) {
            client.send(event, body);
        }
    }

    broadcastGame() {
        this.sendAll("game:state", this.serializeState());
    }

    serializeState() {
        return {
            turn: this.turn,
            board: this.board,
            whiteName: this.whiteName,
            blackName: this.blackName,
        };
    }
}
