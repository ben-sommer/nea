import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { readFile, readdir } from "fs/promises";
import { join } from "path";

// File will be created if it doesn't already exist
const databaseFilename = "db.sqlite";

// Load SQL commands from file
export const sqlFromFile = async (
    type: "definition" | "query" | "update",
    filename: string
) => {
    const sql = await readFile(
        join(__dirname, "..", "..", "sql", type, filename + ".sql")
    );

    return sql.toString();
};

// Load all SQL table definitions
const getDefinitions = async () => {
    const files = await readdir(
        join(__dirname, "..", "..", "sql", "definition")
    );

    let sql = [];

    for (const file of files) {
        sql.push(await sqlFromFile("definition", file.replace(".sql", "")));
    }

    return sql;
};

// Initialise tables and return database connection
export const database = async () => {
    const db = await open({
        filename: databaseFilename,
        driver: sqlite3.Database,
    });

    try {
        const definitions = await getDefinitions();

        await db.exec(definitions.join("\n\n"));

        console.log("Database initialised successfully");
    } catch (e: any) {
        console.log("Could not initialise database");
    }

    return db;
};
