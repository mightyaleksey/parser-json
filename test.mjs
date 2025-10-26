import { parse as crockfordRDP } from './src/crockford-rdp.mjs'
import { parse as crockfordRDP2 } from './src/crockford-rdp-2.mjs'
import { parse as typedClassRDP } from './src/rdp-typed-class.mjs'
import { parse as typedClassRDP2 } from './src/rdp-typed-class-2.mjs'
import { parse as typedRDP } from './src/rdp-typed.mjs'
import { parse as typedRDP2 } from './src/rdp-typed-2.mjs'
import { parse as typedRDP3 } from './src/rdp-typed-3.mjs'

import assert from 'node:assert'
import test from 'node:test'

const parsers = [
  ['crockford rdp', crockfordRDP],
  ['crockford rdp 2 [eval]', crockfordRDP2],
  ['typed rdp', typedRDP],
  ['typed rdp 2', typedRDP2],
  ['typed rdp 3', typedRDP3],
  ['typed rdp class', typedClassRDP],
  ['typed rdp class 2', typedClassRDP2]
]
const variants = [
  'false',
  'null',
  'true',
  'f_',
  'n_',
  't_',
  '0',
  '1',
  '743',
  '-25',
  '5.21',
  '-2.1e3',
  '4e6',
  '4e+3',
  '4e-2',
  '.2',
  '+2',
  '"abc"',
  '"ab\\"c"',
  '"ab\\r\\n"',
  '1  ',
  ' 1 ',
  '  1',
  '[]',
  '[ 1 , "3" ]',
  '{}',
  '{ "k" : 7 }'
]

function isValidInput(input) {
  try {
    JSON.parse(input)
    return true
  } catch (error) {
    return false
  }
}

variants.forEach((input) => {
  const isValid = isValidInput(input)

  for (const [name, parse] of parsers) {
    if (isValid) {
      test(`parser passes for '${input}' (${name})`, () => {
        const value = parse(input)
        assert.deepEqual(value, JSON.parse(input))
      })
    } else {
      test(`parser throws for '${input}' (${name})`, () => {
        assert.throws(() => {
          parse(input)
        })
      })
    }
  }
})
