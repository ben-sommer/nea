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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = exports.sqlFromFile = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const databaseFilename = "db.sqlite";
const sqlFromFile = (type, filename) => __awaiter(void 0, void 0, void 0, function* () {
    const sql = yield (0, promises_1.readFile)((0, path_1.join)(__dirname, "..", "..", "sql", type, filename + ".sql"));
    return sql.toString();
});
exports.sqlFromFile = sqlFromFile;
const getDefinitions = () => __awaiter(void 0, void 0, void 0, function* () {
    const files = yield (0, promises_1.readdir)((0, path_1.join)(__dirname, "..", "..", "sql", "definition"));
    let sql = [];
    for (const file of files) {
        sql.push(yield (0, exports.sqlFromFile)("definition", file.replace(".sql", "")));
    }
    return sql;
});
const database = () => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, sqlite_1.open)({
        filename: databaseFilename,
        driver: sqlite3_1.default.Database,
    });
    try {
        const definitions = yield getDefinitions();
        yield db.exec(definitions.join("\n\n"));
        console.log("Database initialised successfully");
    }
    catch (e) {
        // Tables already exist
        console.log(e.message);
    }
    return db;
});
exports.database = database;
