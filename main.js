const { app, BrowserWindow } = require('electron')

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 1600,
        height: 900,
        webPreferences: {
            nodeIntegration: true
        }
    })

    // and load the index.html of the app.
    win.loadFile('index.html')

    // Open the DevTools.
    win.webContents.openDevTools()
}

app.whenReady().then(createWindow)