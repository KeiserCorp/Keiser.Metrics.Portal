import { app } from 'electron'
import { WebView } from './metricsWindow'
import { OneWire } from './oneWire'

let wv: WebView

app.on('ready', () => {
  wv = new WebView('https://metrics.keiser.com/app', 'Metrics')
  console.log(new OneWire())
})

app.on('window-all-closed', app.quit)
