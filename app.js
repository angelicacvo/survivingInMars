// Application entry point: loads env, starts server, initializes DB and cron jobs

import dotenv from "dotenv";
dotenv.config();
import { Server } from "./src/server.js";

const startApp = async () => {
  try {
    const server = new Server();
  } catch (err) {
    console.error("Error starting app:", err);
    process.exit(1);
  }
};

startApp();
