import { api } from '$lib/api/client.js';

export async function load() {
  try {
    const [rankings, accounts] = await Promise.all([
      api.getRankings(),
      api.getAllAccounts()
    ]);

    // Get snapshots for all accounts for comparison chart
    const snapshotsPromises = accounts.map(acc =>
      api.getAccountSnapshots(acc.id, 50).catch(() => [])
    );
    const allSnapshots = await Promise.all(snapshotsPromises);

    const snapshotsData = allSnapshots.map((snapshots, idx) => ({
      account_id: accounts[idx].id,
      account_name: accounts[idx].account_name,
      strategy: accounts[idx].strategy,
      is_active: accounts[idx].is_active,
      snapshots
    })).filter(data => data.snapshots.length > 0);

    return {
      rankings,
      accounts,
      snapshotsData
    };
  } catch (error) {
    console.error('Error loading rankings:', error);
    return {
      rankings: [],
      accounts: [],
      snapshotsData: [],
      error: error.message
    };
  }
}
