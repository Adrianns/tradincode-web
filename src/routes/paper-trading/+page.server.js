import { api } from '$lib/api/client.js';

export async function load() {
  try {
    const [accounts, rankings, strategies] = await Promise.all([
      api.getAllAccounts(),
      api.getRankings(),
      api.getStrategies()
    ]);

    return {
      accounts,
      rankings,
      strategies
    };
  } catch (error) {
    console.error('Error loading accounts:', error);
    return {
      accounts: [],
      rankings: [],
      strategies: [],
      error: error.message
    };
  }
}
