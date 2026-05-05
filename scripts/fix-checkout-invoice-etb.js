const fs = require('fs')
const path = require('path')

function write(file, s) {
  fs.writeFileSync(file, s)
}

function patch(file, replacers) {
  if (!fs.existsSync(file)) return
  let s = fs.readFileSync(file, 'utf8')
  const orig = s
  for (const [re, fn] of replacers) {
    s = s.replace(re, fn)
  }
  if (s !== orig) write(file, s)
}

const checkoutDir = path.join(__dirname, '../src/views/pages/wizard-examples/checkout')
for (const f of fs.readdirSync(checkoutDir)) {
  if (!f.endsWith('.tsx')) continue
  patch(path.join(checkoutDir, f), [
    [/\$\$\{product\.price\}\//g, '${product.price} ETB/'],
    [/\$\$\{product\.originalPrice\}/g, '${product.originalPrice} ETB'],
    [/\$1198\.00/g, '1198.00 ETB'],
    [/\$5\.00/g, '5.00 ETB'],
    [/\$60 /g, '60 ETB '],
    [/Only for \$2\./g, 'Only for 2 ETB.'],
    [/label='\$10'/g, "label='10 ETB'"],
    [/label='\$15'/g, "label='15 ETB'"],
  ])
}

const invoiceFiles = [
  '../src/views/apps/invoice/preview/PreviewCard.tsx',
  '../src/views/apps/invoice/edit/EditCard.tsx',
  '../src/views/apps/invoice/add/AddCard.tsx',
  '../src/views/apps/invoice/shared/SendInvoiceDrawer.tsx',
].map((rel) => path.join(__dirname, rel))

for (const file of invoiceFiles) {
  patch(file, [
    [/\$12,110\.55/g, '12,110.55 ETB'],
    [/\$24\.00/g, '24.00 ETB'],
    [/\$1800/g, '1800 ETB'],
    [/\$28/g, '28 ETB'],
    [/\$1690/g, '1690 ETB'],
    [/Total: '\$32'/g, "Total: '32 ETB'"],
    [/Total: '\$28'/g, "Total: '28 ETB'"],
    [/Total: '\$24'/g, "Total: '24 ETB'"],
    [/Total: '\$22'/g, "Total: '22 ETB'"],
    [/amount of \$95\.59/g, 'amount of 95.59 ETB'],
  ])
}
