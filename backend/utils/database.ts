import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { readFile, readdir } from "fs/promises";
import { join } from "path";

const databaseFilename = "db.sqlite";

export const sqlFromFile = async (
    type: "definition" | "query" | "update",
    filename: string
) => {
    const sql = await readFile(
        join(__dirname, "..", "..", "sql", type, filename + ".sql")
    );

    return sql.toString();
};

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
        // Tables already exist
        console.log(e.message);
    }

    return db;
};
