import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { database } from "./database";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

(async () => {
    const db = await database();

    app.get("/", async (req: Request, res: Response) => {
        const users = await db.all("SELECT * FROM User");

        res.json(users);
    });

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
})();
