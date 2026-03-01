import {queryDb} from "../../../config/postgresDbConnection.js";

export function addOptionalClause(condition, clause) {
    return condition ? clause : '';
}

export function toArray(v) {
    return Array.isArray(v) ? v : [v];
}

export async function safeQuery(sql, params) {
    try {
        return await queryDb(sql, params);
    } catch (e) {
        console.warn(e.message);
        return null;
    }
}