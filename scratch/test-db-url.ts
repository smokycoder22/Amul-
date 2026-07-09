import assert from 'node:assert/strict'
import { normalizeDatabaseUrl } from '../lib/db'

const sample = 'postgresql://postgres.hviwnuaezzwywlozbmzy:Piyush@171528@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
const normalized = normalizeDatabaseUrl(sample)

assert.equal(
  normalized,
  'postgresql://postgres.hviwnuaezzwywlozbmzy:Piyush%40171528@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
)

console.log('✅ normalizeDatabaseUrl handles @ in password')
