"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Multiplayer = void 0;
const client_1 = require("./client");
const database_1 = require("../utils/database");
const date_1 = require("../utils/date");
class Multiplayer {
    constructor(db) {
        this.clients = [];
        this.db = db;
    }
    addClient(connection, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new client_1.Client(connection);
            const user = yield this.db.get(yield (0, database_1.sqlFromFile)("query", "GetUserByToken"), {
                ":token": token,
            });
            const expiry = (0, date_1.sqlToJsDate)(user.TokenExpiry);
            if (expiry < new Date()) {
                throw new Error("Token Expired");
            }
            client.send("user:players", this.clients.map((client) => ({
                id: client.id,
            })));
            this.clients.push(client);
            connection.on("close", () => {
                this.removeClient(client.id);
            });
        });
    }
    removeClient(id) {
        this.clients = this.clients.filter((client) => client.id !== id);
    }
}
exports.Multiplayer = Multiplayer;
