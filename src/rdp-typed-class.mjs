/**
 * Character codes:
 * - " - 034
 * - + - 043
 * - , - 044
 * - - - 045
 * - . - 046
 * - / - 047
 * - 0 - 048
 * - 9 - 057
 * - : - 058
 * - E - 069
 * - [ - 091
 * - \ - 092
 * - ] - 093
 * - b - 098
 * - e - 101
 * - f - 102
 * - n - 110
 * - r - 114
 * - t - 116
 * - { - 123
 * - } - 125
 */

const decoder = new TextDecoder()
const encoder = new TextEncoder()

const escapeChars = {
  34: '"',
  47: '/',
  92: '\\',
  98: '\b',
  102: '\f',
  110: '\n', // 10
  114: '\r', // 13
  116: '\t'
}

function isFloat(byte) {
  if (byte === 43 || byte === 46 || byte === 69 || byte === 101) return true
  return isInt(byte)
}

function isInt(byte) {
  return byte === 45 || (byte >= 48 && byte <= 57)
}

function isSpace(byte) {
  return byte === 32 || byte === 9 || byte === 10 || byte === 13
}

export class JSONParser {
  constructor() {
    this.cursor = 0
    this.input = null
  }

  _assert(condition) {
    if (!condition) throw new SyntaxError('Invalid character')
  }

  _peek() {
    return this.input[this.cursor]
  }

  _read() {
    this._assert(this.cursor < this.input.length)
    this.cursor++
    return this.input[this.cursor - 1]
  }

  _skipSpace() {
    /**
     * Skip space characters, which are the following:
     * - space - 32
     * - \t    - 9
     * - \n    - 10
     * - \r    - 13
     */
    while (isSpace(this._peek())) this.cursor++
  }

  _array() {
    this.cursor++
    this._skipSpace()

    const arr = []
    if (this._peek() === 93) {
      this.cursor++
      return arr
    }

    while (true) {
      arr.push(this._value())
      this._skipSpace()

      const byte = this._read()
      if (byte === 93) return arr
      this._assert(byte === 44)
    }
  }

  _object() {
    this.cursor++
    this._skipSpace()

    const obj = {}
    if (this._peek() === 125) {
      this.cursor++
      return obj
    }

    while (true) {
      const key = this._string()
      this._skipSpace()
      this._assert(this._read() === 58)
      obj[key] = this._value()
      this._skipSpace()

      const byte = this._read()
      if (byte === 125) return obj
      this._assert(byte === 44)

      this._skipSpace()
    }
  }

  _number() {
    const start = this.cursor
    while (isFloat(this._peek())) this._read()

    const n = decoder.decode(this.input.slice(start, this.cursor))
    this._assert(!isNaN(n))

    return Number(n)
  }

  _string() {
    this._assert(this._read() === 34)

    let str = ''
    while (true) {
      const byte = this._read()
      if (byte === 34) break
      if (byte === 92) {
        const following = this._read()
        this._assert(escapeChars[following] != null)
        str += escapeChars[following]
      } else {
        str += String.fromCharCode(byte)
      }
    }

    return str
  }

  _word(expectedValue, ...bytes) {
    this._assert(bytes.every((byte) => byte === this._read()))
    return expectedValue
  }

  _value() {
    this._skipSpace()

    const byte = this._peek()
    if (byte === 91) return this._array()
    if (byte === 123) return this._object()
    if (byte === 102) return this._word(false, 102, 97, 108, 115, 101)
    if (byte === 110) return this._word(null, 110, 117, 108, 108)
    if (byte === 116) return this._word(true, 116, 114, 117, 101)
    if (byte === 34) return this._string()
    if (isInt(byte)) return this._number()

    this._assert(false)
  }

  parse(input) {
    this.cursor = 0
    this.input = encoder.encode(input)

    const json = this._value()
    this._skipSpace()
    this._assert((this.cursor = this.input.length))

    return json
  }
}

export function parse(input) {
  return new JSONParser().parse(input)
}
