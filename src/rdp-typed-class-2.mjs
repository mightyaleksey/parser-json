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
    this.byte = 0
    this.cursor = 0
    this.input = null
  }

  _assert(condition) {
    if (!condition) throw new SyntaxError('Invalid character')
  }

  _next(byte) {
    this._assert(byte == null || byte === this.byte)
    this.cursor++
    this.byte = this.input[this.cursor]
    return this.byte
  }

  _space() {
    while (isSpace(this.byte)) this._next()
  }

  _array() {
    this._next(91)
    this._space()

    const arr = []
    if (this.byte === 93) {
      this._next(93)
      return arr
    }

    while (true) {
      arr.push(this._value())
      this._space()

      if (this.byte === 93) {
        this._next(93)
        return arr
      }

      this._next(44)
    }
  }

  _object() {
    this._next(123)
    this._space()

    const obj = {}
    if (this.byte === 125) {
      this._next(125)
      return obj
    }

    while (true) {
      const key = this._string()
      this._space()
      this._next(58)
      obj[key] = this._value()
      this._space()

      if (this.byte === 125) {
        this._next(125)
        return obj
      }

      this._next(44)
      this._space()
    }
  }

  _number() {
    const start = this.cursor
    while (isFloat(this.byte)) this._next()

    const n = decoder.decode(this.input.slice(start, this.cursor))
    this._assert(!isNaN(n))

    return Number(n)
  }

  _string() {
    this._next(34)

    let str = ''
    while (true) {
      if (this.byte === 34) {
        this._next(34)
        return str
      }

      if (this.byte === 92) {
        const following = this._next()
        this._assert(escapeChars[following] != null)
        str += escapeChars[following]
      } else {
        str += String.fromCharCode(this.byte)
      }

      this._next()
    }
  }

  _word() {
    if (this.byte === 102) {
      this._next(102)
      this._next(97)
      this._next(108)
      this._next(115)
      this._next(101)
      return false
    }

    if (this.byte === 110) {
      this._next(110)
      this._next(117)
      this._next(108)
      this._next(108)
      return null
    }

    if (this.byte === 116) {
      this._next(116)
      this._next(114)
      this._next(117)
      this._next(101)
      return true
    }

    this._assert(false)
  }

  _value() {
    this._space()

    switch (this.byte) {
      case 123:
        return this._object()
      case 91:
        return this._array()
      case 34:
        return this._string()
      default:
        return isInt(this.byte) ? this._number() : this._word()
    }
  }

  parse(input) {
    this.cursor = 0
    this.input = encoder.encode(input)
    this.byte = this.input[this.cursor]

    const json = this._value()
    this._space()
    this._assert((this.cursor = this.input.length))

    return json
  }
}

export function parse(input) {
  return new JSONParser().parse(input)
}
