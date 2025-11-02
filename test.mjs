import { parse as crockfordEval } from './src/crockford-eval.mjs'
import { parse as crockfordRDP } from './src/crockford-rdp.mjs'
import { parse as rdp } from './src/rdp.mjs'
import { parse as rdpRegex } from './src/rdp-regex.mjs'
import { parse as typedTokenizerBased } from './src/typed-tokenizer-based.mjs'
import { parse as typedClassRDP } from './src/typed-rdp-class.mjs'
import { parse as typedRDP } from './src/typed-rdp-1.mjs'
import { parse as typedRDP2 } from './src/typed-rdp-2.mjs'

import assert from 'node:assert'
import test from 'node:test'

const parsers = [
  // ['crockford rdp', crockfordRDP],
  // ['crockford eval', crockfordEval],
  // ['rdp', rdp],
  // ['rdp regex', rdpRegex],
  // ['typed rdp', typedRDP],
  // ['typed rdp 2', typedRDP2],
  // ['typed rdp class', typedClassRDP],
  ['typed tokenizer based', typedTokenizerBased]
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
