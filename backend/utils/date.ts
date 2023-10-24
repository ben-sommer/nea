export const sqlToJsDate = (date: string) => {
    const t = date.split(/[- :]/).map((component) => parseInt(component));

    const d = new Date(Date.UTC(t[0], t[1] - 1, t[2], t[3], t[4], t[5]));

    return d;
};

export const jsToSqlDate = (date: Date) => {
    return date.toISOString().slice(0, 19).replace("T", " ");
};
