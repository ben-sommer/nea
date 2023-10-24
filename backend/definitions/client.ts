import { v4 as uuid } from "uuid";
import ws from "ws";
import { Multiplayer } from "./multiplayer";

export class Client {
    connection: ws;
    firstName: string;
    lastName: string;
    username: string;
    multiplayer: Multiplayer;
    invitedBy: string[];

    constructor(
        connection: ws,
        username: string,
        firstName: string,
        lastName: string,
        multiplayer: Multiplayer
    ) {
        this.connection = connection;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.multiplayer = multiplayer;
        this.invitedBy = [];

        this.connection.on("message", (message: string) => {
            const parsedMessage = JSON.parse(message.toString());

            const instruction = parsedMessage[0];
            const body = parsedMessage[1] || {};

            switch (instruction) {
                case "game:send-invite":
                    const invitee = this.multiplayer.getClient(body);

                    if (!invitee) {
                        return this.send("game:send-invite:error", body);
                    }

                    invitee.invitedBy.push(this.username);

                    invitee.send("game:invited", this.username);

                    break;
            }
        });
    }

    send(event: string, body?: any) {
        this.connection.send(JSON.stringify([event].concat([body] || [])));
    }
}
