const log = (level, message, data) => {
  const timestamp = new Date().toISOString();

  console[level](
    `[${timestamp}] [${level.toUpperCase()}] ${message}`,
    data || "",
  );
};

const logger = {
  info: (message, data) => log("log", message, data),

  error: (message, data) => log("error", message, data),

  warn: (message, data) => log("warn", message, data),
};

module.exports = logger;
