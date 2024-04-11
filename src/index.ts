import {app, BrowserWindow, Input, ipcMain} from 'electron';
import * as path from "path";
import * as dotenv from "dotenv";

class Main {
    window: BrowserWindow;
    async init() {
        dotenv.config();
        await this.createWindow();
    }

    async createWindow() {
        this.window = new BrowserWindow({
            width: 800,
            height: 600,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                preload: path.join(__dirname, "preload.js")
            }
        });

        this.window.loadFile(path.join(__dirname, "../main/index.html")).then();
        this.window.webContents.on("before-input-event", (_, event: Input) => {
            if(!/^F10$/.test(event.key)) return;

            this.window.webContents.toggleDevTools();
        })
    }
}

app.whenReady().then(() => {
    const main = new Main();
    main.init().then(() => main.window.maximize());
})

app.on("window-all-closed", () => {
    if(process.platform !== "darwin") app.quit();
})

try {
    require('electron-reloader')(module);
} catch {}