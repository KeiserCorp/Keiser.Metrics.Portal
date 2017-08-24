import * as USB from 'usb'
import { EventEmitter } from 'events'
import { OneWireState } from './owState'
// import { crc81wire } from 'crc'

export class OneWireDevice {
  protected device: USB.Device
  protected endpoints: {
    interrupt: USB.InEndpoint & EventEmitter,
    bulkIn: USB.InEndpoint,
    bulkOut: USB.OutEndpoint
  }

  constructor(device: USB.Device) {
    this.device = device
    this.initialize()
  }

  /*****************************************
	 *	Exposed Controls
	 *****************************************/

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

  /*****************************************
   *	Control Flow
   *****************************************/

  protected initialize(): void {
    this.device.open()
    this.claimInterface()
    this.mapEndpoints()
    console.log('Device Opened')
    this.awaitKey()
  }

  protected awaitKey(): void {
    this.reset()
      .then(() => this.pollState())
      .then(() => this.keyDetected())
      .catch((error: Error) => {
        console.error('Error: ', error.message)
        this.device.reset(() => { return })
      })
  }

  protected keyDetected(): void {
    console.log('Key Connected')
  }

  /*****************************************
   *	Interface and Endpoints
   *****************************************/

  protected mapEndpoints(): void {
    let inf = this.device.interface(0)

    this.endpoints = {
      interrupt: inf.endpoints.find((endpoint) => endpoint.direction === 'in' && endpoint.transferType === USB.LIBUSB_TRANSFER_TYPE_INTERRUPT) as USB.InEndpoint & EventEmitter,
      bulkIn: inf.endpoints.find((endpoint) => endpoint.direction === 'in' && endpoint.transferType === USB.LIBUSB_TRANSFER_TYPE_BULK) as USB.InEndpoint,
      bulkOut: inf.endpoints.find((endpoint) => endpoint.direction === 'out' && endpoint.transferType === USB.LIBUSB_TRANSFER_TYPE_BULK) as USB.OutEndpoint
    }
  }

  protected claimInterface(): void {
    this.device.interface(0).claim()
  }

  /*****************************************
   *	1-Wire Commands
   *****************************************/

  protected reset(): Promise<void> {
    return new Promise((resolve, reject) => {
      const callback = (error: any) => { (error) ? reject(error) : resolve() }
      this.device.controlTransfer(0x40, 0x01, 0x0C4B, 0x0001, new Buffer(0), callback)
    })
  }

  protected setSpeed(overdrive: Boolean = false): Promise<void> {
    const index = overdrive ? 0x0002 : 0x0001

    return new Promise((resolve, reject) => {
      const callback = (error: any) => { (error) ? reject(error) : resolve() }
      this.device.controlTransfer(0x40, 0x02, 0x0002, index, new Buffer(0), callback)
    })
  }

  protected pollState(): Promise<OneWireState | Error> {
    return new Promise((resolve, reject) => {
      this.endpoints.interrupt.once('error', (error: Error) => {
        reject(error)
      })
      const dataCallback = (data: Buffer) => {
        const state = new OneWireState(data)
        if (state.hasShort) {
          this.endpoints.interrupt.stopPoll(() => { reject(new Error('Short Detected')) })
          this.endpoints.interrupt.removeListener('data', dataCallback)
        } else if (state.keyDetected) {
          this.endpoints.interrupt.stopPoll(() => { resolve(state) })
          this.endpoints.interrupt.removeListener('data', dataCallback)
        }
      }
      this.endpoints.interrupt.on('data', dataCallback)
      this.endpoints.interrupt.startPoll(0x01, 0x20)
    })
  }
}
