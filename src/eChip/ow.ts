import * as USB from 'usb'
import { OneWireDevice } from './owDevice'

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

  close(): void {
    if (this.targetDevice) {
      this.targetDevice.disconnect()
      this.targetDevice = null
    }
  }

  private attached(device: USB.Device): void {
    if (
      device.deviceDescriptor.idVendor === DALLAS_VENDOR_ID &&
      device.deviceDescriptor.idProduct === DALLAS_PRODUCT_ID
    ) {
      this.connect(device)
    }
  }

  private detached(device: USB.Device): void {
    if (this.targetDevice && this.targetDevice.isSameDevice(device)) {
      this.close()
    }
  }

  private connect(device: USB.Device): void {
    this.targetDevice = new OneWireDevice(device)
  }
}
