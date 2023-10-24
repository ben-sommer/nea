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
            user.LastName
        );

        client.send(
            "user:players",
            this.clients.map((client) => ({
                name: `${client.firstName} ${client.lastName}`,
                username: client.username,
            }))
        );

        // Remove any existing clients with the same account
        this.removeClient(client.username);

        this.clients.push(client);

        connection.on("close", () => {
            this.removeClient(client.username);
        });
    }

    removeClient(username: string) {
        const client = this.getClient(username);

        if (client) {
            client.connection.close();
        }

        this.clients = this.clients.filter(
            (client) => client.username !== username
        );
    }

    getClient(username: string) {
        return this.clients.find((client) => client.username == username);
    }
}
