import pg from 'pg';
const { Pool } = pg;

let pool;

/**
 * Initialize database connection pool
 */
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
  }
  return pool;
}

/**
 * Get latest analysis
 */
export async function getLatestAnalysis() {
  const client = await getPool().connect();
  try {
    const result = await client.query(
      'SELECT * FROM analyses ORDER BY timestamp DESC LIMIT 1'
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

/**
 * Get analyses for chart (last 30 days)
 */
export async function getAnalysesForChart() {
  const client = await getPool().connect();
  try {
    const result = await client.query(`
      SELECT
        timestamp,
        price,
        ma_50,
        ma_200,
        score,
        rsi_weekly
      FROM analyses
      WHERE timestamp > NOW() - INTERVAL '30 days'
      ORDER BY timestamp ASC
    `);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Get recent alerts (last 20)
 */
export async function getRecentAlerts() {
  const client = await getPool().connect();
  try {
    const result = await client.query(
      'SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 20'
    );
    return result.rows;
  } finally {
    client.release();
  }
}

export default {
  getLatestAnalysis,
  getAnalysesForChart,
  getRecentAlerts
};
