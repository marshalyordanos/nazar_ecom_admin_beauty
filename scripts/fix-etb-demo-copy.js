const fs = require('fs')
const path = require('path')

/** Narrow replacements so `${vars}` is untouched */
function patch(content, rules) {
  let o = content
  for (const [re, fn] of rules) {
    o = o.replace(re, fn)
  }
  return o
}

function maybe(file, rules) {
  if (!fs.existsSync(file)) return
  let s = fs.readFileSync(file, 'utf8')
  const n = patch(s, rules)
  if (n !== s) fs.writeFileSync(file, n)
}

const root = path.join(__dirname, '../src/views/dashboards/analytics')

maybe(path.join(root, 'TopReferralSources.tsx'), [
  [/revenue:\s*'\$([^']+)'/g, (_, x) => `revenue: '${x} ETB'`],
])

maybe(path.join(root, 'ProjectStatistics.tsx'), [
  [/budget:\s*'\$([^']+)'/g, (_, x) => `budget: '${x} ETB'`],
])

maybe(path.join(root, 'SalesCountry.tsx'), [
  [/Total \$([\d,]+) Sales/g, (_, x) => `Total ${x} ETB Sales`],
])

maybe(path.join(root, 'WeeklySales.tsx'), [
  [/\$438\.5k/g, 'ETB 438.5k'],
  [/\$22\.4k/g, 'ETB 22.4k'],
])

maybe(path.join(root, 'TotalTransactions.tsx'), [
  [/Last month transactions \$([\d.k]+)/g, (_, x) => `Last month transactions ${x} ETB`],
])

maybe(path.join(root, 'RadialBarChart.tsx'), [
  [/<Typography variant='h5'>\$([\d.k]+)<\/Typography>/g, (_, x) => `<Typography variant='h5'>ETB ${x}</Typography>`],
])

maybe(path.join(root, 'LineChart.tsx'), [
  [/<Typography variant='h5'>\$([\d.k]+)<\/Typography>/g, (_, x) => `<Typography variant='h5'>ETB ${x}</Typography>`],
])

maybe(path.join(root, 'BarChart.tsx'), [
  [/<Typography variant='h5'>\$([\d.k]+)<\/Typography>/g, (_, x) => `<Typography variant='h5'>ETB ${x}</Typography>`],
])

const widgetsCharts = path.join(__dirname, '../src/views/pages/widget-examples/charts')

maybe(path.join(widgetsCharts, 'WeeklySales.tsx'), [
  [/\$438\.5k/g, 'ETB 438.5k'],
  [/\$22\.4k/g, 'ETB 22.4k'],
])

maybe(path.join(widgetsCharts, 'TotalTransactions.tsx'), [
  [/Last month transactions \$([\d.k]+)/g, (_, x) => `Last month transactions ${x} ETB`],
])

maybe(path.join(widgetsCharts, 'SalesCountry.tsx'), [
  [/Total \$([\d,]+) Sales/g, (_, x) => `Total ${x} ETB Sales`],
])

maybe(path.join(widgetsCharts, 'RadialBarChart.tsx'), [
  [/<Typography variant='h5'>\$([\d.k]+)<\/Typography>/g, (_, x) => `<Typography variant='h5'>ETB ${x}</Typography>`],
])

maybe(path.join(widgetsCharts, 'LineChart.tsx'), [
  [/<Typography variant='h5'>\$([\d.k]+)<\/Typography>/g, (_, x) => `<Typography variant='h5'>ETB ${x}</Typography>`],
])

maybe(path.join(widgetsCharts, 'BarChart.tsx'), [
  [/<Typography variant='h5'>\$([\d.k]+)<\/Typography>/g, (_, x) => `<Typography variant='h5'>ETB ${x}</Typography>`],
])

maybe(path.join(widgetsCharts, 'ExternalLinks.tsx'), [
  [/sales:\s*'\$([^']+)'/g, (_, x) => `sales: '${x} ETB'`],
])

maybe(path.join(widgetsCharts, 'MonthlyBudget.tsx'), [
  [/Last month you had \$([\d.]+)/g, (_, x) => `Last month you had ${x}`],
])

const widgetsStatistics = path.join(__dirname, '../src/views/pages/widget-examples/statistics')

maybe(path.join(widgetsStatistics, 'WeeklySalesBg.tsx'), [
  [/Total \$([\d.k]+)/g, (_, x) => `Total ETB ${x}`],
])

maybe(path.join(widgetsStatistics, 'StackedBarChart.tsx'), [
  [/<Typography variant='h5'>\$([\d.k]+)<\/Typography>/g, (_, x) => `<Typography variant='h5'>ETB ${x}</Typography>`],
])

maybe(path.join(widgetsStatistics, 'SmoothLineChart.tsx'), [
  [/<Typography variant='h5'>\$([\d.k]+)<\/Typography>/g, (_, x) => `<Typography variant='h5'>ETB ${x}</Typography>`],
])

maybe(path.join(widgetsStatistics, 'SalesMonth.tsx'), [
  [/<Typography variant='h5'>\$([\d,]+)<\/Typography>/g, (_, x) => `<Typography variant='h5'>${x} ETB</Typography>`],
])

maybe(path.join(widgetsStatistics, 'Sales.tsx'), [
  [/stats:\s*'\$([\d.k]+)'/g, (_, x) => `stats: 'ETB ${x}'`],
])

maybe(path.join(widgetsStatistics, 'RadialBarChart.tsx'), [
  [/<Typography variant='h5'>\$([\d.k]+)<\/Typography>/g, (_, x) => `<Typography variant='h5'>ETB ${x}</Typography>`],
])

maybe(path.join(widgetsStatistics, 'LineChart.tsx'), [
  [/<Typography variant='h5'>\$([\d.k]+)<\/Typography>/g, (_, x) => `<Typography variant='h5'>ETB ${x}</Typography>`],
])

maybe(path.join(widgetsStatistics, 'DonutChart.tsx'), [
  [/<Typography variant='h5'>\$([\d.k]+)<\/Typography>/g, (_, x) => `<Typography variant='h5'>ETB ${x}</Typography>`],
])

maybe(path.join(widgetsStatistics, 'BarChart.tsx'), [
  [/<Typography variant='h5'>\$([\d.k]+)<\/Typography>/g, (_, x) => `<Typography variant='h5'>ETB ${x}</Typography>`],
])

