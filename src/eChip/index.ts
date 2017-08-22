import { OneWire } from './ow'

export class EChip {
  private ow: OneWire

  constructor() {
    this.ow = new OneWire()
  }

  close(): void {
    this.ow.close()
  }
}
