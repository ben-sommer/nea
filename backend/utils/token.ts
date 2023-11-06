import { randomBytes } from "crypto";
import { jsToSqlDate } from "./date";

// Length of time tokens are valid for
// - Not too long that if compromised a bad actor could do serious harm
// - Not too short that the user is required to reauthenticate very often
const validityWindow = 1000 * 60 * 60 * 24;

// Generate and return token and expiry time
export const generateToken = () => {
    const token = randomBytes(256).toString("base64");

    const now = new Date();

    const expiry = jsToSqlDate(new Date(now.getTime() + validityWindow));

    return { token, expiry };
};
