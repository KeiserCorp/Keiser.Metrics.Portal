import * as USB from 'usb'
import { OneWireState } from './owState'

export class OneWireDevice {
  private device: USB.Device
  private endpoints: {
    interrupt: USB.InEndpoint,
    bulkIn: USB.InEndpoint,
    bulkOut: USB.OutEndpoint
  }

  constructor(device: USB.Device) {
    this.device = device
    this.initialize()
  }

  isSameDevice(device: USB.Device): Boolean {
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

  private initialize(): void {
    this.device.open()

    this.claimInterface()
    this.mapEndpoints()
    this.awaitKey()
    console.log('Device Opened')
  }

  private mapEndpoints(): void {
    let inf = this.device.interface(0)

    this.endpoints = {
      interrupt: inf.endpoints.find((endpoint) => endpoint.direction === 'in' && endpoint.transferType === USB.LIBUSB_TRANSFER_TYPE_INTERRUPT) as USB.InEndpoint,
      bulkIn: inf.endpoints.find((endpoint) => endpoint.direction === 'in' && endpoint.transferType === USB.LIBUSB_TRANSFER_TYPE_BULK) as USB.InEndpoint,
      bulkOut: inf.endpoints.find((endpoint) => endpoint.direction === 'out' && endpoint.transferType === USB.LIBUSB_TRANSFER_TYPE_BULK) as USB.OutEndpoint
    }
  }

  private claimInterface(): void {
    this.device.interface(0).claim()
  }

  private getState(): Promise<OneWireState> {
    return new Promise((resolve, reject) => {
      const callback = (error: any, data: Buffer) => {
        (error) ? reject(error) : resolve(new OneWireState(data))
      }
      this.endpoints.interrupt.transfer(0x20, callback)
    })
  }

  private reset(): Promise<void> {
    return new Promise((resolve, reject) => {
      const callback = (error: any) => { (error) ? reject(error) : resolve() }
      this.device.controlTransfer(0x40, 0x01, 0x0C4B, 0x0001, new Buffer(0), callback)
    })
  }

  private awaitKey(): void {
    this.reset()
      .then(() => { return this.getState() })
      .then((state) => {
        if (state.hasShort) {
          throw new Error('Short Detected')
        }
        if (state.keyDetected) {
          this.keyDetected()
        } else {
          setTimeout(() => { this.awaitKey() }, 100)
        }
      })
      .catch((error) => {
        console.error('Error: ', error)
        this.destroy()
        this.initialize()
      })
  }

  private keyDetected(): void {
    console.log('Key Connected')
  }
}
