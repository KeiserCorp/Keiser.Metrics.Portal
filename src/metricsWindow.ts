import { BrowserWindow } from 'electron'

export class WebView {
  window: Electron.BrowserWindow

  constructor(route: string, title?: string) {
    this.window = new BrowserWindow({
      show: false,
      autoHideMenuBar: true,
      title: title
    })

    this.window.maximize()
    this.window.loadURL(route)
    this.window.once('ready-to-show', this.window.show)
  }

}
