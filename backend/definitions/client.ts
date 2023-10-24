import { v4 as uuid } from "uuid";
import ws from "ws";

export class Client {
    connection: ws;
    firstName: string;
    lastName: string;
    username: string;

    constructor(
        connection: ws,
        username: string,
        firstName: string,
        lastName: string
    ) {
        this.connection = connection;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
    }

    send(event: string, body?: any) {
        this.connection.send(JSON.stringify([event].concat([body] || [])));
    }
}
