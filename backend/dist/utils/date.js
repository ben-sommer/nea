"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsToSqlDate = exports.sqlToJsDate = void 0;
const sqlToJsDate = (date) => {
    const t = date.split(/[- :]/).map((component) => parseInt(component));
    const d = new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));
    return d;
};
exports.sqlToJsDate = sqlToJsDate;
const jsToSqlDate = (date) => {
    return date.toISOString().slice(0, 19).replace("T", " ");
};
exports.jsToSqlDate = jsToSqlDate;
