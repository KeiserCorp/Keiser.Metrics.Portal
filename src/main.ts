import { app } from 'electron'
import { WebView } from './metricsWindow'
import { EChip } from './echip'

let wv: WebView
let eChip: EChip

app.on('ready', () => {
  wv = new WebView('https://metrics.keiser.com/app', 'Metrics')
  eChip = new EChip()
})

app.on('window-all-closed', () => {
  eChip.close()
  app.quit()
})
