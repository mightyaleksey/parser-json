import { bench, run } from 'mitata'
import { readFile } from 'node:fs/promises'

import { parse as crockfordEval } from './src/crockford-eval.mjs'
import { parse as crockfordRDP } from './src/crockford-rdp.mjs'
import { parse as rdp } from './src/rdp.mjs'
import { parse as rdpRegex } from './src/rdp-regex.mjs'
import { parse as typedClassRDP } from './src/typed-rdp-class.mjs'
import { parse as typedRDP } from './src/typed-rdp-1.mjs'
import { parse as typedRDP2 } from './src/typed-rdp-2.mjs'
import { parse as typedTokenizerBased } from './src/typed-tokenizer-based.mjs'

const json = await readFile('./sample08.json', 'utf8')

// reference
bench('douglas crockford rdp 800kb', () => crockfordRDP(json)).gc('inner')
bench('douglas crockford eval 800kb', () => crockfordEval(json)).gc('inner')
bench('native 800kb', () => JSON.parse(json)).gc('inner')
// custom
bench('rdp 800kb', () => rdp(json)).gc('inner')
bench('rdp regex 800kb', () => rdpRegex(json)).gc('inner')
bench('typed rdp 800kb', () => typedRDP(json)).gc('inner')
bench('typed rdp 2 800kb', () => typedRDP2(json)).gc('inner')
bench('typed rdp class 800kb', () => typedClassRDP(json)).gc('inner')
bench('typed tokenizer based 800kb', () => typedTokenizerBased(json)).gc(
  'inner'
)

await run()
