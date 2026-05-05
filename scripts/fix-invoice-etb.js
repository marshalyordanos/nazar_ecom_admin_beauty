const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '../src/fake-db/apps/invoice.ts')
let s = fs.readFileSync(file, 'utf8')
s = s.replace(/balance:\s*'-\$(\d+(?:,\d+)*)'/g, "balance: '-$1 ETB'")
s = s.replace(/balance:\s*'\$(\d+(?:,\d+)*)'/g, "balance: '$1 ETB'")
fs.writeFileSync(file, s)
