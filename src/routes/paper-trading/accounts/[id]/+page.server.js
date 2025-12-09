import { api } from '$lib/api/client.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params }) {
  try {
    const accountId = parseInt(params.id);

    if (isNaN(accountId)) {
      throw error(400, 'Invalid account ID');
    }

    const [account, trades, snapshots] = await Promise.all([
      api.getAccountById(accountId),
      api.getAccountTrades(accountId, 50),
      api.getAccountSnapshots(accountId, 100)
    ]);

    if (!account) {
      throw error(404, 'Account not found');
    }

    // Calculate metrics
    const totalTrades = parseInt(account.total_trades) || 0;
    const winningTrades = parseInt(account.winning_trades) || 0;
    const losingTrades = parseInt(account.losing_trades) || 0;
    const totalProfitLoss = parseFloat(account.total_profit_loss) || 0;

    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    const metrics = {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      totalProfitLoss
    };

    return {
      account,
      trades,
      snapshots,
      metrics
    };
  } catch (err) {
    if (err.status) throw err; // Re-throw SvelteKit errors
    console.error('Error loading account:', err);
    throw error(500, err.message || 'Failed to load account');
  }
}

export const actions = {
  toggle: async ({ params }) => {
    try {
      const accountId = parseInt(params.id);
      await api.toggleAccount(accountId);
      return { success: true };
    } catch (err) {
      return { error: err.message };
    }
  },

  delete: async ({ params }) => {
    try {
      const accountId = parseInt(params.id);
      await api.deleteAccount(accountId);
      throw redirect(303, '/paper-trading');
    } catch (err) {
      if (err.status === 303) throw err; // Re-throw redirect
      return { error: err.message };
    }
  }
};
