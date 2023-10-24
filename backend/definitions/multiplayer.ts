import { Database } from "sqlite";
import { Client } from "./client";
import ws from "ws";
import { sqlFromFile } from "../utils/database";
import { sqlToJsDate } from "../utils/date";

export class Multiplayer {
    clients: Client[];
    db: Database;

    constructor(db: Database) {
        this.clients = [];
        this.db = db;
    }

    async addClient(connection: ws, token: string) {
        const client = new Client(connection);

        const user = await this.db.get(
            await sqlFromFile("query", "GetUserByToken"),
            {
                ":token": token,
            }
        );

        const expiry = sqlToJsDate(user.TokenExpiry);

        if (expiry < new Date()) {
            throw new Error("Token Expired");
        }

        client.send(
            "user:players",
            this.clients.map((client) => ({
                id: client.id,
            }))
        );

        this.clients.push(client);

        connection.on("close", () => {
            this.removeClient(client.id);
        });
    }

    removeClient(id: string) {
        this.clients = this.clients.filter((client) => client.id !== id);
    }
}
