export class OneWireState {
  commCommandBufferStatus: Number
  keyDetected: Boolean
  data: Uint8Array | null
  hasShort: Boolean

  constructor(buffer: Buffer) {
    let res = new Uint8Array(buffer)
    this.commCommandBufferStatus = res[11]
    this.keyDetected = Boolean(res[16] && res[16] === 165)
    this.data = res[16] ? res.slice(16, res.length) : null
    this.hasShort = (
      this.commCommandBufferStatus !== 0 ||
      (!this.keyDetected &&
        this.data &&
        (this.data[0] & 0x01) === 1
      )
    )
  }

}
