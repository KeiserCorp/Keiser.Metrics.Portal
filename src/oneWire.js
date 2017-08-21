const TRANSACTION_TIMEOUT = 10

const crc8 = (value) => {
  return require('crc').crc81wire(value)
}

export class OneWire {

}
