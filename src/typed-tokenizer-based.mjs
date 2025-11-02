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

/**
 * Tokenizer
 */

const OPENING_BRACE = 123 // {
const CLOSING_BRACE = 125 // }
const OPENING_BRACKET = 91 // [
const CLOSING_BRACKET = 93 // ]
const COLON = 58 // :
const COMMA = 44 // ,
const STRING = 34
const VALUE = 1

const encoder = new TextEncoder()
const decoder = new TextDecoder()

let byte
let bytes
let cursor

function assert(condition, msg) {
  if (!condition) throw new SyntaxError(msg ?? 'Invalid character')
}

function initTokenizer(input) {
  cursor = 0
  bytes = encoder.encode(input)
  byte = bytes[cursor]
}

const escapee = {
  102: 12,
  110: 10,
  114: 13,
  116: 9,
  34: 34,
  47: 47,
  92: 92,
  98: 8
}

function isFloat(byte) {
  if (byte === 43 || byte === 46 || byte === 69 || byte === 101) return true
  return isInt(byte)
}

function isInt(byte) {
  return byte === 45 || (byte >= 48 && byte <= 57)
}

function getNextToken() {
  // skip spaces (if any)
  while (byte === 32 || byte === 10 || byte === 13 || byte === 9) read()

  if (byte == null) return null

  // get token
  switch (byte) {
    case 123: {
      // object {
      read()
      return [OPENING_BRACE, null]
    }

    case 125: {
      // object }
      read()
      return [CLOSING_BRACE, null]
    }

    case 91: {
      // array [
      read()
      return [OPENING_BRACKET, null]
    }

    case 93: {
      // array ]
      read()
      return [CLOSING_BRACKET, null]
    }

    case 58: {
      // :
      read()
      return [COLON, null]
    }

    case 44: {
      // ,
      read()
      return [COMMA, null]
    }

    case 34: {
      // string
      read()

      let str = ''
      while (true) {
        if (byte === 34) {
          read()
          return [STRING, str]
        }
        if (byte === 92) {
          read()
          assert(escapee[byte] != null)
          byte = escapee[byte]
        }
        str += String.fromCharCode(byte)
        read()
      }
    }

    case 102: {
      // false
      read(102)
      read(97)
      read(108)
      read(115)
      read(101)
      return [VALUE, false]
    }

    case 110: {
      // null
      read(110)
      read(117)
      read(108)
      read(108)
      return [VALUE, null]
    }

    case 116: {
      // true
      read(116)
      read(114)
      read(117)
      read(101)
      return [VALUE, true]
    }

    default:
      if (isInt(byte)) {
        const start = cursor
        while (isFloat(byte)) read()

        const n = decoder.decode(bytes.slice(start, cursor))
        assert(!isNaN(n))

        return [VALUE, n]
      }

      assert(false)
  }
}

function read(bt) {
  if (bt != null) assert(byte === bt)
  return (byte = bytes[++cursor])
}

/**
 * Parser
 */

let lookahead

function eat(tokenType) {
  const token = lookahead
  assert(token != null, 'Unexpected end of input')
  if (tokenType != null)
    assert(
      token[0] === tokenType,
      `Invalid token: ${token[0]}, expected: ${tokenType}`
    )

  lookahead = getNextToken()
  return token[1]
}

function parseValue() {
  assert(lookahead != null)

  switch (lookahead[0]) {
    case OPENING_BRACE: {
      // object
      eat(OPENING_BRACE)

      const obj = {}
      if (lookahead[0] === CLOSING_BRACE) {
        eat(CLOSING_BRACE)
        return obj
      }

      while (true) {
        const key = eat(STRING)
        eat(COLON)
        obj[key] = parseValue()

        if (lookahead[0] === CLOSING_BRACE) {
          eat(CLOSING_BRACE)
          return obj
        }

        eat(COMMA)
      }
    }

    case OPENING_BRACKET: {
      // array
      eat(OPENING_BRACKET)

      const arr = []
      if (lookahead[0] === CLOSING_BRACKET) {
        eat(CLOSING_BRACKET)
        return arr
      }

      while (true) {
        arr.push(parseValue())

        if (lookahead[0] === CLOSING_BRACKET) {
          eat(CLOSING_BRACKET)
          return arr
        }

        eat(COMMA)
      }
    }

    case STRING:
    case VALUE:
      return eat()
  }

  assert(false)
}

export function parse(input) {
  initTokenizer(input)
  // LL(1) (one look ahead)
  lookahead = getNextToken()

  const json = parseValue()
  assert(lookahead == null)

  return json
}
