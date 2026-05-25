import * as postgres from "./postgresDbConnection.js";
import * as databricks from "./databricksConnection.js";

const isDatabricks = process.env["DB_PROVIDER"] === "databricks";

export const queryDb = isDatabricks ? databricks.queryDb : postgres.queryDb;
export const closeDb = isDatabricks ? databricks.closeDb : postgres.closeDb;
export const getQueryHistory = isDatabricks
  ? databricks.getQueryHistory
  : postgres.getQueryHistory;
export const getHistoryOffset = isDatabricks
  ? databricks.getHistoryOffset
  : postgres.getHistoryOffset;
export const clearQueryHistory = isDatabricks
  ? databricks.clearQueryHistory
  : postgres.clearQueryHistory;
export const runWithQueryContext = isDatabricks
  ? databricks.runWithQueryContext
  : postgres.runWithQueryContext;
export const getRunningQueries = isDatabricks
  ? databricks.getRunningQueries
  : postgres.getRunningQueries;
