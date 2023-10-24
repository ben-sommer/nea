import { v4 as uuid } from "uuid";
import ws from "ws";

export class Client {
    connection: ws;
    id: string;

    constructor(connection: ws) {
        this.connection = connection;
        this.id = uuid();
    }

    send(event: string, body?: any) {
        this.connection.send(JSON.stringify([event].concat([body] || [])));
    }
}
