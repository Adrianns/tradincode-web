import pg from 'pg';
const { Pool } = pg;

let pool;

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
 * Get paper trading configuration
 */
export async function getPaperConfig() {
  const client = await getPool().connect();
  try {
    const result = await client.query(
      'SELECT * FROM paper_config ORDER BY id DESC LIMIT 1'
    );
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

/**
 * Update paper trading configuration
 */
export async function updatePaperConfig(updates) {
  const client = await getPool().connect();
  try {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    fields.push('updated_at = NOW()');

    const query = `
      UPDATE paper_config
      SET ${fields.join(', ')}
      WHERE id = (SELECT id FROM paper_config ORDER BY id DESC LIMIT 1)
      RETURNING *
    `;

    const result = await client.query(query, values);
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Get paper trades with pagination
 */
export async function getPaperTrades(page = 1, limit = 20) {
  const client = await getPool().connect();
  try {
    const offset = (page - 1) * limit;

    const result = await client.query(`
      SELECT * FROM paper_trades
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await client.query('SELECT COUNT(*) FROM paper_trades');
    const totalCount = parseInt(countResult.rows[0].count);

    return {
      trades: result.rows,
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    };
  } finally {
    client.release();
  }
}

/**
 * Get trading metrics
 */
export async function getTradingMetrics() {
  const client = await getPool().connect();
  try {
    const result = await client.query(`
      SELECT
        COUNT(*) FILTER (WHERE trade_type = 'buy') as total_buys,
        COUNT(*) FILTER (WHERE trade_type = 'sell') as total_sells,
        COUNT(*) FILTER (WHERE trade_type = 'sell' AND profit_loss_usd > 0) as winning_trades,
        COUNT(*) FILTER (WHERE trade_type = 'sell' AND profit_loss_usd <= 0) as losing_trades,
        AVG(profit_loss_usd) FILTER (WHERE trade_type = 'sell' AND profit_loss_usd > 0) as avg_win,
        AVG(profit_loss_usd) FILTER (WHERE trade_type = 'sell' AND profit_loss_usd <= 0) as avg_loss,
        SUM(profit_loss_usd) FILTER (WHERE trade_type = 'sell') as total_profit_loss,
        MAX(balance_usd + balance_btc * (SELECT btc_price FROM paper_trades ORDER BY created_at DESC LIMIT 1)) as peak_value
      FROM paper_trades
    `);

    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Reset paper trading
 */
export async function resetPaperTrading() {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM paper_trades');

    await client.query(`
      UPDATE paper_config
      SET
        balance_usd = initial_balance,
        balance_btc = 0.00,
        is_active = false,
        started_at = NULL,
        updated_at = NOW()
      WHERE id = (SELECT id FROM paper_config ORDER BY id DESC LIMIT 1)
    `);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Start paper trading
 */
export async function startPaperTrading() {
  const client = await getPool().connect();
  try {
    const result = await client.query(`
      UPDATE paper_config
      SET is_active = true, started_at = NOW(), updated_at = NOW()
      WHERE id = (SELECT id FROM paper_config ORDER BY id DESC LIMIT 1)
      RETURNING *
    `);
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Stop paper trading
 */
export async function stopPaperTrading() {
  const client = await getPool().connect();
  try {
    const result = await client.query(`
      UPDATE paper_config
      SET is_active = false, updated_at = NOW()
      WHERE id = (SELECT id FROM paper_config ORDER BY id DESC LIMIT 1)
      RETURNING *
    `);
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Get portfolio history for charts
 */
export async function getPortfolioHistory() {
  const client = await getPool().connect();
  try {
    const result = await client.query(`
      SELECT
        created_at as timestamp,
        balance_usd + (balance_btc * btc_price) as total_value,
        btc_price
      FROM paper_trades
      ORDER BY created_at ASC
    `);

    return result.rows;
  } finally {
    client.release();
  }
}

export default {
  getPaperConfig,
  updatePaperConfig,
  getPaperTrades,
  getTradingMetrics,
  resetPaperTrading,
  startPaperTrading,
  stopPaperTrading,
  getPortfolioHistory
};
