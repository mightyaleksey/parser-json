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

function isFloat(byte) {
  if (byte === 43 || byte === 46 || byte === 69 || byte === 101) return true
  return isInt(byte)
}

function isInt(byte) {
  return byte === 45 || (byte >= 48 && byte <= 57)
}

const escapee = {
  34: '"',
  47: '/',
  92: '\\',
  98: '\b',
  102: '\f',
  110: '\n', // 10
  114: '\r', // 13
  116: '\t'
}

class JSONParser {
  constructor() {
    this.cursor // number
    this.bytes // Uint8Array
    this.byte // number
  }

  assert(condition) {
    if (!condition) throw new SyntaxError('Invalid character at ' + this.cursor)
  }

  read(bt) {
    if (bt != null) this.assert(this.byte === bt)
    return (this.byte = this.bytes[++this.cursor])
  }

  space() {
    /**
     * Skip space characters, which are the following:
     * - space - 32
     * - \t    - 9
     * - \n    - 10
     * - \r    - 13
     */
    while (
      this.byte === 32 ||
      this.byte === 9 ||
      this.byte === 10 ||
      this.byte === 13
    )
      this.read()
  }

  parseArray() {
    this.read(91)
    this.space()

    const arr = []
    if (this.byte === 93) {
      this.read(93)
      return arr
    }

    while (true) {
      arr.push(this.parseValue())
      this.space()

      if (this.byte === 93) {
        this.read(93)
        return arr
      }
      this.read(44)
    }
  }

  parseObject() {
    this.read(123)
    this.space()

    const obj = {}
    if (this.byte === 125) {
      this.read(125)
      return obj
    }

    while (true) {
      const key = this.parseString()
      this.space()
      this.read(58)
      obj[key] = this.parseValue()
      this.space()

      if (this.byte === 125) {
        this.read(125)
        return obj
      }

      this.read(44)
      this.space()
    }
  }

  parseNumber() {
    const start = this.cursor
    while (isFloat(this.byte)) this.read()

    const n = decoder.decode(this.bytes.slice(start, this.cursor))
    this.assert(!isNaN(n))

    return Number(n)
  }

  parseString() {
    this.read(34)

    let value = ''
    while (true) {
      if (this.byte === 34) {
        this.read(34)
        return value
      }
      if (this.byte === 92) {
        this.read()
        this.assert(escapee[this.byte] != null)
        value += escapee[this.byte]
      } else {
        value += String.fromCharCode(this.byte)
      }

      this.read()
    }
  }

  parseWord() {
    if (this.byte === 102) {
      this.read(102)
      this.read(97)
      this.read(108)
      this.read(115)
      this.read(101)
      return false
    }
    if (this.byte === 110) {
      this.read(110)
      this.read(117)
      this.read(108)
      this.read(108)
      return null
    }
    if (this.byte === 116) {
      this.read(116)
      this.read(114)
      this.read(117)
      this.read(101)
      return true
    }

    this.assert(false)
  }

  parseValue() {
    this.space()
    if (this.byte === 123) return this.parseObject()
    if (this.byte === 91) return this.parseArray()
    if (this.byte === 34) return this.parseString()
    return isInt(this.byte) ? this.parseNumber() : this.parseWord()
  }

  parse(input) {
    this.cursor = 0
    this.bytes = encoder.encode(input)
    this.byte = this.bytes[this.cursor]

    const json = this.parseValue()
    this.space()
    this.assert((this.cursor = this.bytes.length))

    return json
  }
}

export function parse(input) {
  return new JSONParser().parse(input)
}
