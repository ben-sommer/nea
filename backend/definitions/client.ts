import { v4 as uuid } from "uuid";
import ws from "ws";
import { Multiplayer } from "./multiplayer";
import { OnlineGame } from "./onlineGame";

export class Client {
    connection: ws;
    firstName: string;
    lastName: string;
    username: string;
    multiplayer: Multiplayer;
    invitedBy: { [username: string]: boolean };
    sentInvites: { [username: string]: boolean };

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
        this.invitedBy = {};
        this.sentInvites = {};

        this.multiplayer.clients.forEach((client) => {
            if (client.invitedBy[this.username]) {
                this.sentInvites[client.username] = true;
            }

            if (client.sentInvites[this.username]) {
                this.invitedBy[client.username] = true;
            }
        });

        this.connection.on("message", (message: string) => {
            const parsedMessage = JSON.parse(message.toString());

            const instruction = parsedMessage[0];
            const body = parsedMessage[1] || {};

            switch (instruction) {
                case "game:send-invite":
                    {
                        const invitee = this.multiplayer.getClient(body);

                        if (!invitee) {
                            return this.send("game:send-invite:error", body);
                        }

                        invitee.invitedBy[this.username] = true;
                        this.sentInvites[invitee.username] = true;

                        invitee.send("game:invited", this.username);
                    }
                    break;
                case "game:accept-invite":
                    {
                        const invitee = this.multiplayer.getClient(body);

                        if (!invitee) {
                            return this.send(
                                "game:accept-invite:error",
                                invitee
                            );
                        }

                        const game = new OnlineGame([invitee, this]);

                        this.multiplayer.games.push(game);
                    }
                    break;
            }
        });
    }

    send(event: string, body?: any) {
        this.connection.send(JSON.stringify([event].concat([body] || [])));
    }
}
