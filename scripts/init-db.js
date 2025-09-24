#!/usr/bin/env node

/**
 * Database initialization script for Electron app
 * This script ensures the database tables exist in the production environment
 */

import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "node:url";
import { app } from "electron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the user data directory (same as in the main app)
const userDataPath =
  process.env.APPDATA ||
  (process.platform === "darwin"
    ? process.env.HOME + "/Library/Application Support"
    : process.env.HOME + "/.config");
const dbPath = path.join(userDataPath, "electron-vite-react", "app.db");

console.log("Initializing database at:", dbPath);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

async function initializeDatabase() {
  try {
    await prisma.$connect();
    console.log("Connected to database");

    // Create tables if they don't exist
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS "users" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS "settings" (
        "key" TEXT NOT NULL PRIMARY KEY,
        "value" TEXT NOT NULL,
        "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createPostsTable = `
      CREATE TABLE IF NOT EXISTS "posts" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "title" TEXT NOT NULL,
        "content" TEXT,
        "published" BOOLEAN NOT NULL DEFAULT false,
        "author_id" INTEGER NOT NULL,
        "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `;

    await prisma.$executeRawUnsafe(createUsersTable);
    await prisma.$executeRawUnsafe(createSettingsTable);
    await prisma.$executeRawUnsafe(createPostsTable);

    console.log("Database tables created successfully");

    // Test the database by creating a sample user
    try {
      const existingUser = await prisma.user.findFirst();
      if (!existingUser) {
        await prisma.user.create({
          data: {
            name: "Sample User",
            email: "sample@example.com",
          },
        });
        console.log("Sample user created");
      }
    } catch (error) {
      console.log(
        "Sample user already exists or error creating:",
        error.message
      );
    }
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initializeDatabase();
