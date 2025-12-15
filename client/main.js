const { app, BrowserWindow } = require('electron')
const path = require('node:path')

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 400,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        // Hide the standard menu bar for a cleaner "app" look
        autoHideMenuBar: true
    })

    // Determine which file to load
    // (We will create index.html in the next step)
    mainWindow.loadFile('index.html')
}

// When Electron has finished initialization...
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
