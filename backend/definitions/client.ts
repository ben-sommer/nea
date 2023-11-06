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

        // Restore self invite state from currently connected users

        this.multiplayer.clients.forEach((client) => {
            if (client.invitedBy[this.username]) {
                this.sentInvites[client.username] = true;
            }

            if (client.sentInvites[this.username]) {
                this.invitedBy[client.username] = true;
            }
        });

        // Attach WebSocket message handler
        this.connection.on("message", (message: string) => {
            try {
                // Parse JSON message data from
                const parsedMessage = JSON.parse(message.toString());

                // Extract instruction name from message
                const instruction = parsedMessage[0];

                // Extract (optional) body from message
                const body = parsedMessage[1] || {};

                switch (instruction) {
                    case "game:send-invite":
                        {
                            // Get client by username
                            const invitee = this.multiplayer.getClient(body);

                            // Require invitee to exist
                            if (!invitee) {
                                return this.send(
                                    "game:send-invite:error",
                                    body
                                );
                            }

                            // Update invite map state
                            invitee.invitedBy[this.username] = true;
                            this.sentInvites[invitee.username] = true;

                            // Send recipient notification
                            invitee.send(
                                "game:send-invite:success",
                                this.username
                            );
                        }
                        break;
                    case "game:accept-invite":
                        {
                            // Get inviter by username
                            const inviter = this.multiplayer.getClient(body);

                            // Require inviter to exist
                            if (!inviter) {
                                return this.send(
                                    "game:accept-invite:error",
                                    inviter
                                );
                            }

                            // Require inviter to have invited self
                            if (!this.invitedBy[body] == true) {
                                return this.send(
                                    "game:accept-invite:error",
                                    inviter
                                );
                            }

                            // Initialise instance of OnlineGame class with both players
                            const game = new OnlineGame([inviter, this]);

                            this.multiplayer.games.push(game);

                            // Update all clients with currently ongoing games
                            this.multiplayer.broadcastGames();
                        }
                        break;
                    case "game:spectate":
                        {
                            // Extract black and white player usernames from message body
                            const { black, white } = body;

                            const game = this.multiplayer.getGame(black, white);

                            game?.spectators.push(this);

                            // Send new spectator game state
                            game?.broadcastGame();
                        }
                        break;
                    case "game:spectate-stop":
                        {
                            // Extract black and white player usernames from message body
                            const { black, white } = body;

                            const game = this.multiplayer.getGame(black, white);

                            // Remove spectator from instance of Game class
                            if (game) {
                                game.spectators = game?.spectators.filter(
                                    (user) => user.username !== this.username
                                );
                            }
                        }
                        break;
                }
            } catch (e: any) {
                console.log(
                    e.message ||
                        "An error occured when processing a socket message"
                );
            }
        });
    }

    send(event: string, body?: any) {
        this.connection.send(JSON.stringify([event].concat([body] || [])));
    }

    // Serialise self state for transmission
    serialize() {
        return {
            firstName: this.firstName,
            lastName: this.lastName,
            username: this.username,
            invitedBy: this.invitedBy,
            sentInvites: this.sentInvites,
        };
    }
}
