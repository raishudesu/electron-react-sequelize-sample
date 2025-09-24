import { app, BrowserWindow, shell, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { update } from "./update";
import { databaseService } from "../../src/services/database";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

async function createWindow() {
  // Initialize database
  try {
    await databaseService.initialize();
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }

  win = new BrowserWindow({
    title: "Main window",
    icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  // Auto update
  update(win);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});

// Database IPC handlers using Sequelize
ipcMain.handle("db-create-user", async (_, name: string, email: string) => {
  try {
    return await databaseService.createUser(name, email);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
});

ipcMain.handle("db-get-user", async (_, id: number) => {
  try {
    return await databaseService.getUser(id);
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
});

ipcMain.handle("db-get-all-users", async () => {
  try {
    return await databaseService.getAllUsers();
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
});

ipcMain.handle(
  "db-update-user",
  async (_, id: number, name: string, email: string) => {
    try {
      return await databaseService.updateUser(id, name, email);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
);

ipcMain.handle("db-delete-user", async (_, id: number) => {
  try {
    return await databaseService.deleteUser(id);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
});

ipcMain.handle("db-set-setting", async (_, key: string, value: string) => {
  try {
    return await databaseService.setSetting(key, value);
  } catch (error) {
    console.error("Error setting setting:", error);
    throw error;
  }
});

ipcMain.handle("db-get-setting", async (_, key: string) => {
  try {
    return await databaseService.getSetting(key);
  } catch (error) {
    console.error("Error getting setting:", error);
    throw error;
  }
});

// Post operations
ipcMain.handle(
  "db-create-post",
  async (
    _,
    title: string,
    content: string | null,
    authorId: number,
    published: boolean = false
  ) => {
    try {
      return await databaseService.createPost(
        title,
        content,
        authorId,
        published
      );
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }
);

ipcMain.handle("db-get-post", async (_, id: number) => {
  try {
    return await databaseService.getPost(id);
  } catch (error) {
    console.error("Error getting post:", error);
    throw error;
  }
});

ipcMain.handle("db-get-all-posts", async () => {
  try {
    return await databaseService.getAllPosts();
  } catch (error) {
    console.error("Error getting all posts:", error);
    throw error;
  }
});

ipcMain.handle(
  "db-update-post",
  async (
    _,
    id: number,
    title: string,
    content: string | null,
    published: boolean
  ) => {
    try {
      return await databaseService.updatePost(id, title, content, published);
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  }
);

ipcMain.handle("db-delete-post", async (_, id: number) => {
  try {
    return await databaseService.deletePost(id);
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
});
