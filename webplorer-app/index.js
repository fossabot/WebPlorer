const { app, BrowserWindow } = require('electron')
  
let win



function createWindow() {
  
  win = new BrowserWindow({
    width: 960,
    height: 540,
  
    
  })
  
  win.setMenuBarVisibility(false);
  win.setAutoHideMenuBar(true);


  win.loadURL(
'http://localhost:3000/')
  
  win.on('closed', () => {
    win = null
  })
  
  win.webContents.on('new-window', (event, url) => {
  
    event.preventDefault()
    win.loadURL(url)
  })
}
  

app.on('ready', createWindow)