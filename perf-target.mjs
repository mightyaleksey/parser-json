import { readFile } from 'node:fs/promises'
import { parse } from './src/rdp-typed-2.mjs'

(async function run() {
  const json900 = await readFile('./sample10.json', 'utf8')

  const iterations = 100
  const start = Date.now()

  for (var i = 0; i < iterations; i++) parse(json900)

  const total = Date.now() - start
  console.log('%d ms', total / iterations)
})()