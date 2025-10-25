import { bench, run } from 'mitata'
import { readFile } from 'node:fs/promises'

import { parse as crockfordRDP } from './src/crockford-rdp.mjs'
import { parse as crockfordRDP2 } from './src/crockford-rdp-2.mjs'
import { parse as typedClassRDP } from './src/rdp-typed-class.mjs'
import { parse as typedClassRDP2 } from './src/rdp-typed-class-2.mjs'
import { parse as typedRDP } from './src/rdp-typed.mjs'

const json900 = await readFile('./sample900.json', 'utf8')

// reference
bench('douglas crockford rdp 900kb', () => crockfordRDP(json900)).gc('inner')
bench('douglas crockford rdp 2 [eval] 900kb', () => crockfordRDP2(json900)).gc('inner')
// custom
bench('typed rdp 900kb', () => typedRDP(json900)).gc('inner')
bench('typed rdp class 900kb', () => typedClassRDP(json900)).gc('inner')
bench('typed rdp class 2 900kb', () => typedClassRDP2(json900)).gc('inner')

await run()
