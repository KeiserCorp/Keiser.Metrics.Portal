import { app } from 'electron'
import { WebView } from './metricsWindow'

let wv: WebView

app.on('ready', () => {
  wv = new WebView('https://metrics.keiser.com/app', 'Metrics')
})
