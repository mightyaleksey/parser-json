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

const encoder = new TextEncoder()

let cursor // number
let bytes // Uint8Array
let byte // number

function assert(condition) {
  if (!condition) throw new SyntaxError('Invalid character at ' + cursor)
}

function read(bt) {
  if (bt != null) assert(byte === bt)
  return (byte = bytes[++cursor])
}

function space() {
  /**
   * Skip space characters, which are the following:
   * - space - 32
   * - \t    - 9
   * - \n    - 10
   * - \r    - 13
   */
  while (byte === 32 || byte === 9 || byte === 10 || byte === 13) read()
}

function parseArray() {
  read(91)
  space()

  const arr = []
  if (byte === 93) {
    read()
    return arr
  }

  while (true) {
    arr.push(parseValue())
    space()

    if (byte === 93) {
      read()
      return arr
    }
    read(44)
  }
}

function parseObject() {
  read(123)
  space()

  const obj = {}
  if (byte === 125) {
    read()
    return obj
  }

  while (true) {
    const key = parseString()
    space()
    read(58)
    obj[key] = parseValue()
    space()

    if (byte === 125) {
      read()
      return obj
    }

    read(44)
    space()
  }
}

function parseNumber() {
  // -1.2e-3
  let sign = 1
  let tmp = 1
  let value = 0
  // check sign
  if (byte === 45) {
    sign = -sign
    read() // skip '-'
  }
  // get int part
  while (48 <= byte && byte <= 57) {
    value = 10 * value + byte - 48
    read()
  }

  // get fractional part
  if (byte === 46) {
    read() // skip '.'
    while (48 <= byte && byte <= 57) {
      tmp /= 10
      value += tmp * (byte - 48)
      read()
    }
  }

  value *= sign // apply sign

  // check mantissa
  if (byte === 69 || byte === 101) {
    read() // skip 'e' or 'E'

    sign = byte === 45 ? -1 : 1
    tmp = 0

    if (byte === 43 || byte === 45) read()
    while (48 <= byte && byte <= 57) {
      tmp = 10 * tmp + byte - 48
      read()
    }

    value *= Math.pow(10, sign * tmp)
  }

  assert(isFinite(value))
  return value
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

function parseString() {
  read(34)

  let value = ''
  while (true) {
    if (byte === 34) {
      read()
      return value
    }
    if (byte === 92) {
      read()
      assert(escapee[byte] != null)
      value += escapee[byte]
    } else {
      value += String.fromCharCode(byte)
    }

    read()
  }
}

function parseWord() {
  if (byte === 102) {
    read(102)
    read(97)
    read(108)
    read(115)
    read(101)
    return false
  }
  if (byte === 110) {
    read(110)
    read(117)
    read(108)
    read(108)
    return null
  }
  if (byte === 116) {
    read(116)
    read(114)
    read(117)
    read(101)
    return true
  }

  assert(false)
}

function parseValue() {
  space()
  if (byte === 123) return parseObject()
  if (byte === 91) return parseArray()
  if (byte === 34) return parseString()
  if (byte === 45) return parseNumber()
  return byte >= 48 && byte <= 57 ? parseNumber() : parseWord()
}

export function parse(input) {
  cursor = 0
  bytes = encoder.encode(input)
  byte = bytes[cursor]

  const json = parseValue()
  space()
  assert(cursor = bytes.length)

  return json
}
