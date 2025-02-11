const logger = console.warn;

console.warn = function (message, ...optionalParams) {
  if (message.includes("@duckdb")) {
    return;
  }
  logger(message, ...optionalParams);
};
