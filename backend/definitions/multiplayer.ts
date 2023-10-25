import { Database } from "sqlite";
import { Client } from "./client";
import ws from "ws";
import { sqlFromFile } from "../utils/database";
import { sqlToJsDate } from "../utils/date";
import { Game } from "./game";
import { OnlineGame } from "./onlineGame";

export class Multiplayer {
    clients: Client[];
    games: OnlineGame[];
    db: Database;

    constructor(db: Database) {
        this.clients = [];
        this.games = [];
        this.db = db;
    }

    async addClient(connection: ws, token: string) {
        const user = await this.db.get(
            await sqlFromFile("query", "GetUserByToken"),
            {
                ":token": token,
            }
        );

        if (!user) {
            throw new Error("User not found");
        }

        const expiry = sqlToJsDate(user.TokenExpiry);

        if (expiry < new Date()) {
            throw new Error("Token expired");
        }

        const client = new Client(
            connection,
            user.Username,
            user.FirstName,
            user.LastName,
            this
        );

        // Remove any existing clients with the same username
        this.removeClient(client.username);

        this.clients.push(client);

        this.broadcastPlayers();

        client.send("auth:login:success", this.serializeClient(client));

        for (const game of this.games) {
            if (game.clients.find((user) => user.username == client.username)) {
                if (
                    (client.username == game.blackName && game.white) ||
                    (client.username == game.whiteName && game.black)
                ) {
                    game.reconnect(client);
                }
            }
        }

        client.connection.on("message", (message: string) => {
            const parsedMessage = JSON.parse(message);

            const instruction = parsedMessage[0];

            if (instruction == "auth:logout") {
                this.removeClient(client.username, true);
            }
        });

        client.connection.on("close", () => {
            this.removeClient(client.username);
        });
    }

    removeClient(username: string, keepOpen?: boolean) {
        const client = this.getClient(username);

        if (client) {
            if (!keepOpen) client.connection.close();

            this.clients = this.clients.filter(
                (client) => client.username !== username
            );

            // for (const game of this.games) {
            //     if (
            //         game.clients.find(
            //             (user) => user.username == client.username
            //         )
            //     ) {
            //         if (client.username == game.blackName && game.white) {
            //             game.black = null;
            //             game.clients = [game.white];
            //         } else if (
            //             client.username == game.whiteName &&
            //             game.black
            //         ) {
            //             game.white = null;
            //             game.clients = [game.black];
            //         }
            //     }
            // }

            this.broadcastPlayers();
        }
    }

    getClient(username: string) {
        return this.clients.find((client) => client.username == username);
    }

    broadcastPlayers() {
        this.clients.forEach((client) => {
            client.send(
                "info:players",
                this.clients.map((c) => this.serializeClient(c))
            );
        });
    }

    serializeClient(client: Client) {
        return {
            firstName: client.firstName,
            lastName: client.lastName,
            username: client.username,
            invitedBy: client.invitedBy,
            sentInvites: client.sentInvites,
        };
    }
}
