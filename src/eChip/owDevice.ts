import * as USB from 'usb'
import { EventEmitter } from 'events'
import { OneWireState } from './owState'
// import { crc81wire } from 'crc'

export class OneWireDevice {
  private device: USB.Device
  private endpoints: {
    interrupt: USB.InEndpoint & EventEmitter,
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

  disconnect() {
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
      interrupt: inf.endpoints.find((endpoint) => endpoint.direction === 'in' && endpoint.transferType === USB.LIBUSB_TRANSFER_TYPE_INTERRUPT) as USB.InEndpoint & EventEmitter,
      bulkIn: inf.endpoints.find((endpoint) => endpoint.direction === 'in' && endpoint.transferType === USB.LIBUSB_TRANSFER_TYPE_BULK) as USB.InEndpoint,
      bulkOut: inf.endpoints.find((endpoint) => endpoint.direction === 'out' && endpoint.transferType === USB.LIBUSB_TRANSFER_TYPE_BULK) as USB.OutEndpoint
    }
  }

  private claimInterface(): void {
    this.device.interface(0).claim()
  }

  private pollState(): Promise<OneWireState | Error> {
    return new Promise((resolve, reject) => {
      this.endpoints.interrupt.on('error', (error: Error) => {
        reject(error)
      })
      this.endpoints.interrupt.on('data', (data: Buffer) => {
        const state = new OneWireState(data)
        if (state.hasShort) {
          const callback = () => { reject(new Error('Short Detected')) }
          this.endpoints.interrupt.stopPoll(callback)
        } else if (state.keyDetected) {
          const callback = () => { resolve(state) }
          this.endpoints.interrupt.stopPoll(callback)
        }
      })
      this.endpoints.interrupt.startPoll(0x01, 0x20)
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
      .then(() => this.pollState())
      .then(() => this.keyDetected())
      .catch((error: Error) => {
        console.error('Error: ', error.message)
        this.device.reset(() => { return })
      })
  }

  private keyDetected(): void {
    console.log('Key Connected')
  }
}
