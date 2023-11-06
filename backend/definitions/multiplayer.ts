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
        // Check token is valid
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

        // Check token hasn't expired
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
        // Only one concurrent login per user supported
        this.removeClient(client.username);

        this.clients.push(client);

        this.broadcastPlayers();
        this.broadcastGames();

        client.send("auth:login:success", client.serialize());

        for (const game of this.games) {
            if (game.clients.find((user) => user.username == client.username)) {
                if (
                    (client.username == game.blackName && game.white) ||
                    (client.username == game.whiteName && game.black)
                ) {
                    // Reconnect to any ongoing games if applicable
                    game.reconnect(client);
                }
            }
        }

        // Listen for log out instruction
        client.connection.on("message", (message: string) => {
            const parsedMessage = JSON.parse(message);

            const instruction = parsedMessage[0];

            if (instruction == "auth:logout") {
                // Remove client but keep WebSocket open
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

            this.broadcastPlayers();
            this.broadcastGames();
        }
    }

    getClient(username: string) {
        return this.clients.find((client) => client.username == username);
    }

    getGame(black: string, white: string) {
        return this.games.find(
            (game) =>
                game.black?.username == black && game.white?.username == white
        );
    }

    broadcastPlayers() {
        this.clients.forEach((client) => {
            client.send(
                "info:players",
                this.clients.map((c) => c.serialize())
            );
        });
    }

    broadcastGames() {
        this.clients.forEach((client) => {
            client.send(
                "info:games",
                this.games.map((g) => g.serialize())
            );
        });
    }

    removeGame(black: Client | null, white: Client | null) {
        if (!black || !white) {
            return;
        }

        this.games = this.games.filter(
            (game) =>
                !(
                    game.black?.username == black.username &&
                    game.white?.username == white.username
                )
        );
    }
}
