import { getLatestAnalysis, getAnalysesForChart, getRecentAlerts } from '$lib/db.js';

/**
 * Load data for the dashboard
 */
export async function load() {
  try {
    const [latest, historical, alerts] = await Promise.all([
      getLatestAnalysis(),
      getAnalysesForChart(),
      getRecentAlerts()
    ]);

    return {
      latest: latest ? {
        price: parseFloat(latest.price),
        ma50: latest.ma_50 ? parseFloat(latest.ma_50) : null,
        ma200: latest.ma_200 ? parseFloat(latest.ma_200) : null,
        rsiWeekly: latest.rsi_weekly ? parseFloat(latest.rsi_weekly) : null,
        macdWeekly: latest.macd_weekly ? parseFloat(latest.macd_weekly) : null,
        macdSignal: latest.macd_signal ? parseFloat(latest.macd_signal) : null,
        bbUpper: latest.bb_upper ? parseFloat(latest.bb_upper) : null,
        bbMiddle: latest.bb_middle ? parseFloat(latest.bb_middle) : null,
        bbLower: latest.bb_lower ? parseFloat(latest.bb_lower) : null,
        score: latest.score,
        timestamp: latest.timestamp
      } : null,
      historical: historical.map(h => ({
        timestamp: new Date(h.timestamp).getTime(),
        price: parseFloat(h.price),
        ma50: h.ma_50 ? parseFloat(h.ma_50) : null,
        ma200: h.ma_200 ? parseFloat(h.ma_200) : null,
        score: h.score,
        rsiWeekly: h.rsi_weekly ? parseFloat(h.rsi_weekly) : null
      })),
      alerts: alerts.map(a => ({
        id: a.id,
        type: a.type,
        message: a.message,
        score: a.score,
        timestamp: a.timestamp
      }))
    };
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    return {
      latest: null,
      historical: [],
      alerts: [],
      error: 'Failed to load data. Please check database connection.'
    };
  }
}
