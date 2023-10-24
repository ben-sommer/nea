import { randomBytes } from "crypto";
import { jsToSqlDate } from "./date";

const validityWindow = 1000 * 60 * 60 * 24;

export const generateToken = () => {
    const token = randomBytes(256).toString("base64");

    const now = new Date();

    const expiry = jsToSqlDate(new Date(now.getTime() + validityWindow));

    return { token, expiry };
};
