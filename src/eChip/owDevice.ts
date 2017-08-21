import * as USB from 'usb'

export class OneWireDevice {
  private device: USB.Device

  constructor(device: USB.Device) {
    this.device = device
    try {
      this.device.open()
      console.log('Device Opened')
    } catch (error) {
      console.error('Error opening device: ', error)
    }
  }

  isSameDevice(device: USB.Device) {
    return device.busNumber === this.device.busNumber &&
      device.deviceAddress === this.device.deviceAddress
  }

  destroy() {
    try {
      this.device.close()
      console.log('Device Closed')
    } catch (error) {
      console.error('Error closing device: ', error)
    }
  }

  reset() {
    return new Promise((resolve, reject) => {
      const callback = (error?: string | undefined, data?: Buffer | undefined) => {
        if (error) {
          return reject(error)
        }
        resolve(data)
      }
      this.device.controlTransfer(0x40, 0x01, 0x0C4B, 0x0001, new Buffer(''), callback)
    })
      .then((res) => {
        console.log('Reset Success')
        return res
      })
  }
}
