import * as USB from 'usb'
import { OneWireDevice } from './owDevice'
// import { crc81wire } from 'crc'

// const TRANSACTION_TIMEOUT = 10
const DALLAS_VENDOR_ID = 0x04FA
const DALLAS_PRODUCT_ID = 0x2490

export class OneWire {
  private targetDevice: OneWireDevice | null

  constructor() {
    USB.on('attach', (device) => { this.attached(device) })
    USB.on('detach', (device) => { this.detached(device) })

    let device = USB.findByIds(DALLAS_VENDOR_ID, DALLAS_PRODUCT_ID)
    if (device) {
      this.connect(device)
    }
  }

  close() {
    if (this.targetDevice) {
      this.targetDevice.destroy()
      this.targetDevice = null
    }
  }

  private attached(device: USB.Device) {
    if (
      device.deviceDescriptor.idVendor === DALLAS_VENDOR_ID &&
      device.deviceDescriptor.idProduct === DALLAS_PRODUCT_ID
    ) {
      this.connect(device)
    }
  }

  private detached(device: USB.Device) {
    if (this.targetDevice && this.targetDevice.isSameDevice(device)) {
      this.close()
    }
  }

  private connect(device: USB.Device) {
    this.targetDevice = new OneWireDevice(device)
    this.targetDevice.reset()
      .catch((error?: any) => {
        console.log('oops! - ', error)
      })
  }
}
