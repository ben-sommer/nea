import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { database, sqlFromFile } from "./database";
import { string, object } from "yup";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { generateToken } from "./utils/token";

dotenv.config();

const app: Express = express();

app.use(express.json());

const port = process.env.PORT;

(async () => {
    const db = await database();

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
            const result = await db.get(await sqlFromFile("query", "GetUser"), {
                ":username": body.username,
            });

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

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
})();
