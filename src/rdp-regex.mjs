let cursor // number
let input // string
let char // string

function assert(condition) {
  if (!condition) throw new SyntaxError('Invalid character at ' + cursor)
}

function read(ch) {
  assert(cursor < input.length)
  if (ch != null) assert(char === ch)
  return (char = input[++cursor])
}

function space() {
  /**
   * Skip space characters, which are the following:
   * - space - 32
   * - \t    - 9
   * - \n    - 10
   * - \r    - 13
   */
  while (/\s/.test(char)) read()
}

function parseArray() {
  read('[')
  space()

  const arr = []
  if (char === ']') {
    read(']')
    return arr
  }

  while (true) {
    arr.push(parseValue())
    space()

    if (char === ']') {
      read(']')
      return arr
    }
    read(',')
  }
}

function parseObject() {
  read('{')
  space()

  const obj = {}
  if (char === '}') {
    read('}')
    return obj
  }

  while (true) {
    const key = parseString()
    space()
    read(':')
    obj[key] = parseValue()
    space()

    if (char === '}') {
      read('}')
      return obj
    }

    read(',')
    space()
  }
}

function parseNumber() {
  const start = cursor
  while (cursor < input.length && /[0-9-.eE+]/.test(char)) read()

  const n = input.substring(start, cursor)
  assert(!isNaN(n))

  return Number(n)
}

const escapee = {
  '"': '"',
  '/': '/',
  '\\': '\\',
  'b': '\b',
  'f': '\f',
  'n': '\n', // 10
  'r': '\r', // 13
  't': '\t'
}

function parseString() {
  read('"')

  let value = ''
  while (true) {
    if (char === '"') {
      read('"')
      return value
    }
    if (char === '\\') {
      read()
      assert(escapee[char] != null)
      value += escapee[char]
    } else {
      value += char
    }

    read()
  }
}

function parseWord() {
  if (char === 'f') {
    read('f')
    read('a')
    read('l')
    read('s')
    read('e')
    return false
  }
  if (char === 'n') {
    read('n')
    read('u')
    read('l')
    read('l')
    return null
  }
  if (char === 't') {
    read('t')
    read('r')
    read('u')
    read('e')
    return true
  }

  assert(false)
}

function parseValue() {
  space()
  if (char === '{') return parseObject()
  if (char === '[') return parseArray()
  if (char === '"') return parseString()
  return /[0-9-]/.test(char) ? parseNumber() : parseWord()
}

export function parse(value) {
  cursor = 0
  input = value
  char = value[cursor]

  const json = parseValue()
  space()
  assert(cursor = input.length)

  return json
}
