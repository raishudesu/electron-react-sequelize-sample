import { Sequelize } from "sequelize";
import { app } from "electron";
import path from "path";

// Database path configuration

const dbPath = path.join(process.cwd(), "database.sqlite");

// Initialize Sequelize
export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: dbPath,
  logging: false, // Set to console.log to see SQL queries
  dialectOptions: {
    // Use better-sqlite3 as the SQLite driver
    options: {
      // better-sqlite3 specific options
    },
  },
});
