const fs = require('fs')

function patch(path, rules) {
  let s = fs.readFileSync(path, 'utf8')
  const orig = s
  for (const [re, fn] of rules) {
    s = s.replace(re, fn)
  }
  if (s !== orig) fs.writeFileSync(path, s)
}

patch('c:/dev/Ecom-admin/src/views/pages/widget-examples/advanced/TopReferralSources.tsx', [
  [/price:\s*'\$([^']*)'/g, (_, x) => `price: '${x} ETB'`],
])

patch('c:/dev/Ecom-admin/src/views/pages/widget-examples/advanced/Transactions.tsx', [
  [/amount:\s*'\+\$\s*([\d,.]+)'/g, (_, x) => `amount: '+${x} ETB'`],
  [/amount:\s*'-\$\s*([\d,.]+)'/g, (_, x) => `amount: '-${x} ETB'`],
])
