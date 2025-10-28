import { bench, run } from 'mitata'
import { readFile } from 'node:fs/promises'

import { parse as crockfordEval } from './src/crockford-eval.mjs'
import { parse as crockfordRDP } from './src/crockford-rdp.mjs'
import { parse as rdp } from './src/rdp.mjs'
import { parse as rdpRegex } from './src/rdp-regex.mjs'
import { parse as typedClassRDP } from './src/rdp-typed-class.mjs'
import { parse as typedRDP } from './src/rdp-typed-1.mjs'
import { parse as typedRDP2 } from './src/rdp-typed-2.mjs'

const json = await readFile('./sample09.json', 'utf8')

// reference
bench('douglas crockford rdp 900kb', () => crockfordRDP(json)).gc('inner')
bench('douglas crockford eval 900kb', () => crockfordEval(json)).gc('inner')
bench('native 900kb', () => JSON.parse(json)).gc('inner')
// custom
bench('rdp 900kb', () => rdp(json)).gc('inner')
bench('rdp regex 900kb', () => rdpRegex(json)).gc('inner')
bench('typed rdp 900kb', () => typedRDP(json)).gc('inner')
bench('typed rdp 2 900kb', () => typedRDP2(json)).gc('inner')
bench('typed rdp class 900kb', () => typedClassRDP(json)).gc('inner')

await run()
