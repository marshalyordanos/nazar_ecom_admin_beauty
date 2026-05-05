/**
 * Remove USD `$` prefix from quoted price/value/earning in fake ecommerce DB.
 * Values stay numeric strings (e.g. '999') so formatAmountEt parses them correctly.
 */
const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '../src/fake-db/apps/ecommerce.ts')
let s = fs.readFileSync(file, 'utf8')
for (const key of ['price', 'value', 'earning']) {
  const re = new RegExp(`${key}: '\\$([^']+)'`, 'g')
  s = s.replace(re, `${key}: '$1'`)
}
fs.writeFileSync(file, s)
console.log('Updated', file)
