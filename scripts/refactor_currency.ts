import fs from 'fs'
import path from 'path'

function findFiles(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file))
    if (stat.isDirectory()) {
      findFiles(path.join(dir, file), fileList)
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(path.join(dir, file))
    }
  }
  return fileList
}

const files = findFiles(path.join(process.cwd(), 'src'))
let replacedCount = 0

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8')
  
  if (content.includes('Intl.NumberFormat')) {
    // Determine path depth to context
    const parts = file.replace(process.cwd(), '').split(path.sep)
    // 1 depth (src) -> './context'
    // 2 depth (src/pages) -> '../context'
    // 3 depth (src/pages/admin) -> '../../context'
    // 4 depth (src/components/cart) -> '../../context'
    
    // Actually we can just do absolute import? Vite allows /src/... if aliased, but let's just count slashes from src
    const srcIndex = parts.indexOf('src')
    const depth = parts.length - srcIndex - 2
    const prefix = depth === 0 ? './' : '../'.repeat(depth)
    const contextImport = `import { useCurrency } from '${prefix}context/CurrencyContext'\n`

    // Remove the static declaration
    content = content.replace(/const currency = new Intl\.NumberFormat\([^)]+\)/g, '')
    content = content.replace(/const currency = new Intl\.NumberFormat\([^)]+\}[^)]+\)/g, '')

    // Add import after first import
    content = content.replace(/^(import.*?\n)/, `$1${contextImport}`)

    // Inject hook
    // Replace: export function MyComp({ props }) {
    // With:    export function MyComp({ props }) {\n  const { formatPrice } = useCurrency()
    content = content.replace(/(export function [a-zA-Z0-9_]+\([^)]*\)\s*\{)/g, `$1\n  const { formatPrice } = useCurrency()`)

    // Replace currency.format(xxx)
    content = content.replace(/currency\.format\(([^)]+)\)/g, 'formatPrice($1)')

    fs.writeFileSync(file, content)
    replacedCount++
    console.log('Refactored', file)
  }
}

console.log('Total refactored files:', replacedCount)
