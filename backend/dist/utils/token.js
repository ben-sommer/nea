"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const crypto_1 = require("crypto");
const validityWindow = 1000 * 60 * 60 * 24;
const generateToken = () => {
    const token = (0, crypto_1.randomBytes)(256).toString("base64");
    const now = new Date();
    const expiry = new Date(now.getTime() + validityWindow)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    return { token, expiry };
};
exports.generateToken = generateToken;
