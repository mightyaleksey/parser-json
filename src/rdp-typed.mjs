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

function _assert(condition) {
  if (!condition) throw new SyntaxError('Invalid character')
}

function _peek(state) {
  return state.input[state.cursor]
}

function _read(state) {
  _assert(state.cursor < state.input.length)
  state.cursor++
  return state.input[state.cursor - 1]
}

function _skipSpace(state) {
  while (isSpace(_peek(state))) state.cursor++
}

function _array(state) {
  state.cursor++
  _skipSpace(state)

  const arr = []
  if (_peek(state) === 93) {
    state.cursor++
    return arr
  }

  while (true) {
    arr.push(_value(state))
    _skipSpace(state)

    const byte = _read(state)
    if (byte === 93) return arr
    _assert(byte === 44)
  }
}

function _object(state) {
  state.cursor++
  _skipSpace(state)

  const obj = {}
  if (_peek(state) === 125) {
    state.cursor++
    return obj
  }

  while (true) {
    const key = _string(state)
    _skipSpace(state)
    _assert(_read(state) === 58)
    obj[key] = _value(state)
    _skipSpace(state)

    const byte = _read(state)
    if (byte === 125) return obj
    _assert(byte === 44)

    _skipSpace(state)
  }
}

function _number(state) {
  const start = state.cursor
  while (isFloat(_peek(state))) _read(state)

  const n = decoder.decode(state.input.slice(start, state.cursor))
  _assert(!isNaN(n))

  return Number(n)
}

function _string(state) {
  _assert(_read(state) === 34)

  let str = ''
  while (true) {
    const byte = _read(state)
    if (byte === 34) break
    if (byte === 92) {
      const following = _read(state)
      _assert(escapeChars[following] != null)
      str += escapeChars[following]
    } else {
      str += String.fromCharCode(byte)
    }
  }

  return str
}

function _word(state, expectedValue, ...bytes) {
  _assert(bytes.every((byte) => byte === _read(state)))
  return expectedValue
}

function _value(state) {
  _skipSpace(state)

  const byte = _peek(state)
  if (byte === 91) return _array(state)
  if (byte === 123) return _object(state)
  if (byte === 102) return _word(state, false, 102, 97, 108, 115, 101)
  if (byte === 110) return _word(state, null, 110, 117, 108, 108)
  if (byte === 116) return _word(state, true, 116, 114, 117, 101)
  if (byte === 34) return _string(state)
  if (isInt(byte)) return _number(state)

  _assert(false)
}

export function parse(input) {
  const state = { cursor: 0, input: encoder.encode(input) }

  const json = _value(state)
  _skipSpace(state)
  _assert((state.cursor = state.input.length))

  return json
}
