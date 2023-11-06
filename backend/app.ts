import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { database, sqlFromFile } from "./utils/database";
import { string, object } from "yup";
import bcrypt from "bcrypt";
import { generateToken } from "./utils/token";
import expressWebsocket from "express-ws";
import { Multiplayer } from "./definitions/multiplayer";

// Load environment variables from .env file
dotenv.config();

// Initialise express app
const baseApp: Express = express();
const port = process.env.PORT;

// Enable WebSocket middleware
const { app } = expressWebsocket(baseApp);

// Enable JSON post body parsing middleware
app.use(express.json());

// Enable CORS via custom middleware
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

(async () => {
    // Get database connection
    const db = await database();

    const multiplayer = new Multiplayer(db);

    // Registration route handler
    app.post("/register", async (req: Request, res: Response) => {
        // Enforce schema
        const schema = object({
            username: string()
                .required()
                .matches(/^(?=[a-zA-Z0-9._]{3,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/),
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

        // Generate initial authentication token
        const { token, expiry } = generateToken();

        // Hash password
        const hashedPassword = await bcrypt.hash(body.password, 10);

        try {
            // Create user row in database
            await db.run(await sqlFromFile("update", "CreateUser"), {
                ":username": body.username,
                ":firstName": body.firstName,
                ":lastName": body.lastName,
                ":passwordHash": hashedPassword,
                ":token": token,
                ":tokenExpiry": expiry,
            });

            // Return token so it can be sent on subsequent requests
            res.json({ token });
        } catch (e: any) {
            console.log(e.message);
            return res.sendStatus(500);
        }
    });

    // Sign in route handler
    app.post("/signin", async (req: Request, res: Response) => {
        // Enforce schema
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
            // Check user exists
            const result = await db.get(
                await sqlFromFile("query", "GetUserByUsername"),
                {
                    ":username": body.username,
                }
            );

            hashedPassword = result.PasswordHash;
        } catch (e: any) {
            console.log(e.message);
            return res.status(400).send("Please check your login information");
        }

        // Generate new authentication token
        const { token, expiry } = generateToken();

        // Ensure hash matches
        const passwordOk = await bcrypt.compare(
            body.password,
            hashedPassword || ""
        );

        if (!passwordOk) {
            // Reject request with HTTP 401 Unauthorised
            return res.sendStatus(401);
        }

        try {
            // Update current token in db
            await db.run(await sqlFromFile("update", "UpdateUserToken"), {
                ":username": body.username,
                ":token": token,
                ":tokenExpiry": expiry,
            });

            // Return token so it can be sent on subsequent requests
            return res.json({ token });
        } catch (e: any) {
            console.log(e.message);
            return res.sendStatus(400);
        }
    });

    // leaderboard route handler
    app.get("/leaderboard", async (req, res) => {
        // Get leaderboard data via aggregate query on Game table
        const result = await db.all(
            await sqlFromFile("query", "GetLeaderboard")
        );

        res.json(result);
    });

    // WebSocket handler
    app.ws("/multiplayer", async (ws, req) => {
        ws.on("message", async (message) => {
            try {
                // Parse JSON message data from
                const parsedMessage = JSON.parse(message.toString());

                // Extract instruction name from message
                const instruction = parsedMessage[0];

                // Extract (optional) body from message
                const body = parsedMessage[1] || {};

                // Let all other messages be handled by the Multiplayer class
                if (body && instruction == "auth:login") {
                    try {
                        // Try to add client to instance of Multiplayer class
                        // Will fail if token is invalid
                        await multiplayer.addClient(ws, body);
                    } catch (e: any) {
                        let error = "An error occurred - please try again";

                        switch (e.message) {
                            case "User not found":
                                error = "Please check your login information";
                                break;
                            case "Token expired":
                                error =
                                    "Your session has expired - please login again";
                                break;
                        }

                        // Return error message for display
                        ws.send(JSON.stringify(["auth:login:error", error]));
                    }
                }
            } catch (e: any) {
                console.log(
                    e.message ||
                        "An error occured when processing a socket message"
                );
            }
        });
    });

    // Start server on port specified in .env file
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
})();
