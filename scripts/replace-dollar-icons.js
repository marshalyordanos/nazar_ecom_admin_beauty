const fs = require('fs')
const path = require('path')

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (/\.(tsx|ts)$/.test(e.name)) {
      let s = fs.readFileSync(p, 'utf8')
      const n = s.replace(/ri-money-dollar-circle-line/g, 'ri-coins-line')
      if (s !== n) fs.writeFileSync(p, n)
    }
  }
}

walk(path.join(__dirname, '../src'))
