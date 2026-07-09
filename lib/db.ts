import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg'

export function normalizeDatabaseUrl(
  connectionString?: string
): string | undefined {
  if (!connectionString) return undefined

  try {
    const url = new URL(connectionString)

    if (url.password) {
      url.password = decodeURIComponent(url.password)
    }

    return url.toString()
  } catch {
    return connectionString
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not configured')
}

const pool = new Pool({
  connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL),

  ssl:
    process.env.DATABASE_URL.includes('supabase.com') ||
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,

  // Conservative starting point for serverless deployment.
  // Supabase transaction pooler handles connection multiplexing.
  max: 5,

  // Close unused connections after 30 seconds.
  idleTimeoutMillis: 30000,

  // Fail instead of hanging too long when DB is unavailable.
  connectionTimeoutMillis: 10000,
})

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  try {
    return await pool.query<T>(text, params)
  } catch (error) {
    console.error('Database query failed:', {
      message: error instanceof Error ? error.message : 'Unknown error',
    })

    throw error
  }
}

export async function getConnection(): Promise<PoolClient> {
  return pool.connect()
}

export { pool }