"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = require("path");
const dotenv = require("dotenv");
class Main {
    window;
    async init() {
        dotenv.config();
        await this.createWindow();
    }
    async createWindow() {
        this.window = new electron_1.BrowserWindow({
            width: 800,
            height: 600,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, "preload.js")
            }
        });
        this.window.loadFile(path.join(__dirname, "../main/index.html")).then();
        this.window.webContents.on("before-input-event", (_, event) => {
            if (!/^F10$/.test(event.key))
                return;
            this.window.webContents.toggleDevTools();
        });
    }
}
electron_1.app.whenReady().then(() => {
    const main = new Main();
    main.init().then(() => main.window.maximize());
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
try {
    require('electron-reloader')(module);
}
catch { }
