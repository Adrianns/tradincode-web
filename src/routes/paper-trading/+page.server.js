import {
  getPaperConfig,
  getPaperTrades,
  getTradingMetrics,
  getPortfolioHistory
} from '$lib/paper-trading-db.js';
import { getLatestAnalysis } from '$lib/db.js';

export async function load() {
  try {
    const [config, tradesData, metrics, portfolioHistory, latestAnalysis] = await Promise.all([
      getPaperConfig(),
      getPaperTrades(1, 20),
      getTradingMetrics(),
      getPortfolioHistory(),
      getLatestAnalysis()
    ]);

    const currentPrice = latestAnalysis?.price ? parseFloat(latestAnalysis.price) : 0;

    return {
      config: config ? {
        id: config.id,
        isActive: config.is_active,
        initialBalance: parseFloat(config.initial_balance),
        balanceUsd: parseFloat(config.balance_usd),
        balanceBtc: parseFloat(config.balance_btc),
        startedAt: config.started_at,
        percentagePerTrade: config.percentage_per_trade,
        buyThreshold: config.buy_threshold,
        sellThreshold: config.sell_threshold,
        takeProfitPercentage: config.take_profit_percentage,
        stopLossPercentage: config.stop_loss_percentage
      } : null,
      trades: tradesData.trades.map(t => ({
        id: t.id,
        tradeType: t.trade_type,
        btcPrice: parseFloat(t.btc_price),
        btcAmount: parseFloat(t.btc_amount),
        usdAmount: parseFloat(t.usd_amount),
        balanceUsd: parseFloat(t.balance_usd),
        balanceBtc: parseFloat(t.balance_btc),
        scoreAtTrade: t.score_at_trade,
        reason: t.reason,
        profitLossUsd: t.profit_loss_usd ? parseFloat(t.profit_loss_usd) : null,
        profitLossPercentage: t.profit_loss_percentage ? parseFloat(t.profit_loss_percentage) : null,
        createdAt: t.created_at
      })),
      pagination: {
        total: tradesData.total,
        page: tradesData.page,
        limit: tradesData.limit,
        totalPages: tradesData.totalPages
      },
      metrics: {
        totalBuys: parseInt(metrics.total_buys) || 0,
        totalSells: parseInt(metrics.total_sells) || 0,
        winningTrades: parseInt(metrics.winning_trades) || 0,
        losingTrades: parseInt(metrics.losing_trades) || 0,
        avgWin: metrics.avg_win ? parseFloat(metrics.avg_win) : 0,
        avgLoss: metrics.avg_loss ? parseFloat(metrics.avg_loss) : 0,
        totalProfitLoss: metrics.total_profit_loss ? parseFloat(metrics.total_profit_loss) : 0
      },
      portfolioHistory: portfolioHistory.map(h => ({
        timestamp: new Date(h.timestamp).getTime(),
        totalValue: parseFloat(h.total_value),
        btcPrice: parseFloat(h.btc_price)
      })),
      currentPrice
    };
  } catch (error) {
    console.error('Error loading paper trading data:', error);
    return {
      config: null,
      trades: [],
      pagination: { total: 0, page: 1, limit: 20, totalPages: 0 },
      metrics: {
        totalBuys: 0,
        totalSells: 0,
        winningTrades: 0,
        losingTrades: 0,
        avgWin: 0,
        avgLoss: 0,
        totalProfitLoss: 0
      },
      portfolioHistory: [],
      currentPrice: 0,
      error: 'Failed to load paper trading data'
    };
  }
}
