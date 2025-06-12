import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import readline from 'readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve))
}

async function main() {
  console.log('\n🚀 ESLint Setup')
  const configPath = path.join(process.cwd(), '.eslintrc.json')
  let shouldCreate = !fs.existsSync(configPath)

  if (!shouldCreate) {
    const overwrite = await ask('❓ .eslintrc.json exists. Overwrite? (y/n): ')
    shouldCreate = overwrite.trim().toLowerCase() === 'y'
  }

  if (shouldCreate) {
    const useNext = await ask('❓ Use Next.js ESLint configuration? (y/n): ')
    const config = {
      extends: ['next', 'next/core-web-vitals'],
    }
    if (useNext.trim().toLowerCase() !== 'y') {
      config.extends = ['eslint:recommended']
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
    console.log('✅ Created .eslintrc.json')
  }

  console.log('\n📦 Installing ESLint dependencies...')
  try {
    execSync('pnpm add -D eslint eslint-config-next @typescript-eslint/parser @typescript-eslint/eslint-plugin ts-node', { stdio: 'inherit' })
    console.log('✅ Dependencies installed')
  } catch (err) {
    console.error('❌ Failed to install dependencies')
    console.error(err)
  }

  console.log('\n🎉 ESLint setup complete. Run `npm run lint` to lint the project.')
  rl.close()
}

main().catch((err) => {
  console.error('❌ ESLint setup failed:', err)
  rl.close()
  process.exit(1)
})
