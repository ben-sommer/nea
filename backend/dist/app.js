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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./database");
const yup_1 = require("yup");
const bcrypt_1 = __importDefault(require("bcrypt"));
const token_1 = require("./utils/token");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process.env.PORT;
(() => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, database_1.database)();
    app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const users = yield db.all("SELECT * FROM User");
        res.json(users);
    }));
    app.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const schema = (0, yup_1.object)({
            username: (0, yup_1.string)().required().min(3).max(16),
            firstName: (0, yup_1.string)().required().min(1).max(256),
            lastName: (0, yup_1.string)().required().min(1).max(256),
            password: (0, yup_1.string)().required().min(8).max(16),
        });
        let body = null;
        try {
            body = yield schema.validate(req.body);
        }
        catch (e) {
            console.log(e.message);
            return res.sendStatus(400);
        }
        const { token, expiry } = (0, token_1.generateToken)();
        const hashedPassword = yield bcrypt_1.default.hash(body.password, 10);
        try {
            yield db.run(yield (0, database_1.sqlFromFile)("query", "CreateUser"), {
                ":username": body.username,
                ":firstName": body.firstName,
                ":lastName": body.lastName,
                ":passwordHash": hashedPassword,
                ":token": token,
                ":tokenExpiry": expiry,
            });
            res.json({ token });
        }
        catch (e) {
            console.log(e.message);
            return res.sendStatus(500);
        }
    }));
    app.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const schema = (0, yup_1.object)({
            username: (0, yup_1.string)().required().min(3).max(16),
            password: (0, yup_1.string)().required().min(1),
        });
        let body = null;
        try {
            body = yield schema.validate(req.body);
        }
        catch (e) {
            console.log(e.message);
            return res.sendStatus(400);
        }
        let hashedPassword = null;
        try {
            const result = yield db.get(yield (0, database_1.sqlFromFile)("query", "GetUser"), {
                ":username": body.username,
            });
            hashedPassword = result.PasswordHash;
        }
        catch (e) {
            console.log(e.message);
            return res.sendStatus(400);
        }
        const { token, expiry } = (0, token_1.generateToken)();
        const passwordOk = yield bcrypt_1.default.compare(body.password, hashedPassword || "");
        if (!passwordOk) {
            return res.sendStatus(401);
        }
        try {
            yield db.run(yield (0, database_1.sqlFromFile)("update", "UpdateUserToken"), {
                ":username": body.username,
                ":token": token,
                ":tokenExpiry": expiry,
            });
            return res.json({ token });
        }
        catch (e) {
            console.log(e.message);
            return res.sendStatus(400);
        }
    }));
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}))();
