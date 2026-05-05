const fs = require('fs')
const path = require('path')

function fixFile(relPath, fieldRes) {
  const file = path.join(__dirname, '..', relPath)
  let s = fs.readFileSync(file, 'utf8')
  for (const { re, tpl } of fieldRes) {
    s = s.replace(re, tpl)
  }
  fs.writeFileSync(file, s)
  console.log('Updated', file)
}

fixFile('src/fake-db/pages/widgetExamples.ts', [
  { re: /stats: '\$([^']+)'/g, tpl: "stats: '$1 ETB'" }
])

fixFile('src/fake-db/pages/userProfile.ts', [
  { re: /budget: '\$([^']+)'/g, tpl: "budget: '$1 ETB'" },
  { re: /budgetSpent: '\$([^']+)'/g, tpl: "budgetSpent: '$1 ETB'" }
])
