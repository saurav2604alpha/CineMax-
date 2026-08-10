const mongoose = require("mongoose");

let connectionPromise = null;

const REQUIRED_ENVIRONMENT_VARIABLES = ["MONGO_URL", "ACCESS_TOKEN", "REFRESH_TOKEN"];

const getMissingEnvironmentVariables = () => {
  const missing = REQUIRED_ENVIRONMENT_VARIABLES.filter(name => !process.env[name]?.trim());

  if (
    process.env.NODE_ENV === "production" &&
    !process.env.CLIENT_URLS?.trim() &&
    !process.env.CLIENT_URL?.trim()
  ) {
    missing.push("CLIENT_URLS");
  }

  return missing;
};

const getDatabaseState = () => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] || "unknown";
};

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!process.env.MONGO_URL?.trim()) {
    throw new Error("MONGO_URL is not configured");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10000 })
      .then(() => mongoose.connection)
      .catch(error => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
};

module.exports = {
  connectToDatabase,
  getDatabaseState,
  getMissingEnvironmentVariables,
};
