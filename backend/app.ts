import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { database, sqlFromFile } from "./utils/database";
import { string, object } from "yup";
import bcrypt from "bcrypt";
import { generateToken } from "./utils/token";
import expressWebsocket from "express-ws";
import { Multiplayer } from "./definitions/multiplayer";
import cookieParser from "cookie-parser";

dotenv.config();

const baseApp: Express = express();
const { app } = expressWebsocket(baseApp);
const port = process.env.PORT;
app.use(express.json());
app.use(cookieParser());

(async () => {
    const db = await database();

    const multiplayer = new Multiplayer(db);

    app.get("/", async (req: Request, res: Response) => {
        const users = await db.all("SELECT * FROM User");

        res.json(users);
    });

    app.post("/register", async (req: Request, res: Response) => {
        const schema = object({
            username: string().required().min(3).max(16),
            firstName: string().required().min(1).max(256),
            lastName: string().required().min(1).max(256),
            password: string().required().min(8).max(16),
        });

        let body = null;

        try {
            body = await schema.validate(req.body);
        } catch (e: any) {
            console.log(e.message);
            return res.sendStatus(400);
        }

        const { token, expiry } = generateToken();

        const hashedPassword = await bcrypt.hash(body.password, 10);

        try {
            await db.run(await sqlFromFile("query", "CreateUser"), {
                ":username": body.username,
                ":firstName": body.firstName,
                ":lastName": body.lastName,
                ":passwordHash": hashedPassword,
                ":token": token,
                ":tokenExpiry": expiry,
            });

            res.json({ token });
        } catch (e: any) {
            console.log(e.message);
            return res.sendStatus(500);
        }
    });

    app.post("/login", async (req: Request, res: Response) => {
        const schema = object({
            username: string().required().min(3).max(16),
            password: string().required().min(1),
        });

        let body = null;

        try {
            body = await schema.validate(req.body);
        } catch (e: any) {
            console.log(e.message);
            return res.sendStatus(400);
        }

        let hashedPassword = null;

        try {
            const result = await db.get(
                await sqlFromFile("query", "GetUserByUsername"),
                {
                    ":username": body.username,
                }
            );

            hashedPassword = result.PasswordHash;
        } catch (e: any) {
            console.log(e.message);
            return res.sendStatus(400);
        }

        const { token, expiry } = generateToken();

        const passwordOk = await bcrypt.compare(
            body.password,
            hashedPassword || ""
        );

        if (!passwordOk) {
            return res.sendStatus(401);
        }

        try {
            await db.run(await sqlFromFile("update", "UpdateUserToken"), {
                ":username": body.username,
                ":token": token,
                ":tokenExpiry": expiry,
            });

            return res.json({ token });
        } catch (e: any) {
            console.log(e.message);
            return res.sendStatus(400);
        }
    });

    app.ws("/multiplayer", async (ws, req) => {
        if (!req.cookies.token) {
            return ws.close();
        }

        try {
            await multiplayer.addClient(ws, req.cookies.token);
        } catch (e: any) {
            if (e.message == "Token Expired") {
                ws.send(JSON.stringify(["auth:expired"]));
                return ws.close();
            }
        }
    });

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
})();
