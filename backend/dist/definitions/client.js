"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const uuid_1 = require("uuid");
class Client {
    constructor(connection) {
        this.connection = connection;
        this.id = (0, uuid_1.v4)();
    }
    send(event, body) {
        this.connection.send(JSON.stringify([event].concat([body] || [])));
    }
}
exports.Client = Client;
