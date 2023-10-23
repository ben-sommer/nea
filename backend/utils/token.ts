import { randomBytes } from "crypto";

const validityWindow = 1000 * 60 * 60 * 24;

export const generateToken = () => {
    const token = randomBytes(256).toString("base64");

    const now = new Date();

    const expiry = new Date(now.getTime() + validityWindow)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

    return { token, expiry };
};
