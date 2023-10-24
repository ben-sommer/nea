"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const crypto_1 = require("crypto");
const date_1 = require("./date");
const validityWindow = 1000 * 60 * 60 * 24;
const generateToken = () => {
    const token = (0, crypto_1.randomBytes)(256).toString("base64");
    const now = new Date();
    const expiry = (0, date_1.jsToSqlDate)(new Date(now.getTime() + validityWindow));
    return { token, expiry };
};
exports.generateToken = generateToken;
