"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
class Client {
    constructor(connection, username, firstName, lastName) {
        this.connection = connection;
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
    }
    send(event, body) {
        this.connection.send(JSON.stringify([event].concat([body] || [])));
    }
}
exports.Client = Client;
