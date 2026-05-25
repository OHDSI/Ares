const DEV_MODES = new Set(["dev", "development"]);

export function validateEnv(): void {
  const missing: string[] = [];
  const isDev = DEV_MODES.has(process.env["NODE_ENV"] ?? "");
  const isDatabricks = process.env["DB_PROVIDER"] === "databricks";

  if (isDatabricks) {
    if (!process.env["DATABRICKS_HOST"]) missing.push("DATABRICKS_HOST");
    if (!process.env["DATABRICKS_HTTP_PATH"])
      missing.push("DATABRICKS_HTTP_PATH");
    if (!process.env["DATABRICKS_TOKEN"]) missing.push("DATABRICKS_TOKEN");
  } else if (!isDev) {
    // Required outside dev - defaults silently connect to the wrong DB
    if (!process.env["DATABASE_NAME"]) missing.push("DATABASE_NAME");
    if (!process.env["DATABASE_USERNAME"]) missing.push("DATABASE_USERNAME");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}
