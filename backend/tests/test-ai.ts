import 'dotenv/config'
import fs from 'fs'
import { categorizeWithGemini } from './src/lib/ai/gemini.js'

async function run() {
  try {
    const res = await categorizeWithGemini('This is a whatsapp gold phishing scam please click here')
    fs.writeFileSync('error.txt', JSON.stringify(res, null, 2))
  } catch (error: any) {
    fs.writeFileSync('error.txt', error.stack || error.message || String(error))
  }
}

run()
