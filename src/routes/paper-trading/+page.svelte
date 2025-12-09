<script>
  import { goto } from '$app/navigation';
  import { api } from '$lib/api/client.js';

  export let data;

  let accounts = data.accounts || [];
  let rankings = data.rankings || [];
  let strategies = data.strategies || [];

  // Get current BTC price from any active account or default to 0
  $: currentBtcPrice = accounts.length > 0 ? 95000 : 0; // TODO: fetch from API

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStrategyLabel(strategyValue) {
    const strategy = strategies.find(s => s.value === strategyValue);
    return strategy ? strategy.label : strategyValue;
  }

  function getStatusColor(isActive) {
    return isActive ? '#22c55e' : '#9ca3af';
  }

  function getProfitColor(value) {
    if (value > 0) return '#22c55e';
    if (value < 0) return '#ef4444';
    return '#6b7280';
  }

  function calculateTotalValue(account) {
    return parseFloat(account.balance_usd) + (parseFloat(account.balance_btc) * currentBtcPrice);
  }

  function calculateROI(account) {
    const totalValue = calculateTotalValue(account);
    const initialBalance = parseFloat(account.initial_balance);
    return ((totalValue - initialBalance) / initialBalance) * 100;
  }

  function calculateWinRate(account) {
    const totalTrades = parseInt(account.total_trades) || 0;
    const winningTrades = parseInt(account.winning_trades) || 0;
    return totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  }

  async function toggleAccount(accountId) {
    try {
      await api.toggleAccount(accountId);
      // Reload data
      location.reload();
    } catch (error) {
      alert('Error toggling account: ' + error.message);
    }
  }

  async function deleteAccount(accountId, accountName) {
    if (!confirm(`Are you sure you want to delete "${accountName}"? This will delete all trades associated with this account.`)) {
      return;
    }

    try {
      await api.deleteAccount(accountId);
      // Reload data
      location.reload();
    } catch (error) {
      alert('Error deleting account: ' + error.message);
    }
  }

  function goToAccountDetails(accountId) {
    goto(`/paper-trading/accounts/${accountId}`);
  }

  function goToCreateAccount() {
    goto('/paper-trading/accounts/create');
  }

  function goToRankings() {
    goto('/paper-trading/rankings');
  }

  // Get top 3 accounts by ROI
  $: top3Accounts = [...accounts]
    .map(acc => ({
      ...acc,
      roi: calculateROI(acc)
    }))
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 3);
</script>

<svelte:head>
  <title>Paper Trading Accounts - Tradincode</title>
</svelte:head>

<div class="paper-trading">
  <header>
    <div class="header-content">
      <div>
        <h1>📊 Multi-Account Paper Trading</h1>
        <p class="subtitle">Manage multiple trading strategies in parallel</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" on:click={goToCreateAccount}>
          + Create New Account
        </button>
        {#if rankings.length > 0}
          <button class="btn-secondary" on:click={goToRankings}>
            🏆 View Rankings
          </button>
        {/if}
      </div>
    </div>
  </header>

  {#if data.error}
    <div class="error-banner">⚠️ {data.error}</div>
  {/if}

  <!-- Top 3 Accounts -->
  {#if top3Accounts.length > 0}
    <section class="top-accounts">
      <h2>Top Performing Accounts</h2>
      <div class="top-accounts-grid">
        {#each top3Accounts as account, index}
          <div class="top-account-card rank-{index + 1}" on:click={() => goToAccountDetails(account.id)}>
            <div class="rank-badge">
              {#if index === 0}🥇
              {:else if index === 1}🥈
              {:else}🥉
              {/if}
            </div>
            <h3>{account.account_name}</h3>
            <p class="strategy">{getStrategyLabel(account.strategy)}</p>
            <div class="roi-value" style="color: {getProfitColor(account.roi)}">
              {account.roi >= 0 ? '+' : ''}{account.roi.toFixed(2)}% ROI
            </div>
            <div class="account-stats">
              <span>{calculateWinRate(account).toFixed(1)}% Win Rate</span>
              <span>{account.total_trades || 0} Trades</span>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- All Accounts Table -->
  <section class="accounts-section">
    <div class="section-header">
      <h2>All Accounts ({accounts.length})</h2>
    </div>

    {#if accounts.length > 0}
      <div class="accounts-table-container">
        <table class="accounts-table">
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Strategy</th>
              <th>Status</th>
              <th>Balance USD</th>
              <th>Balance BTC</th>
              <th>Total Value</th>
              <th>ROI</th>
              <th>Win Rate</th>
              <th>Trades</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each accounts as account}
              {@const totalValue = calculateTotalValue(account)}
              {@const roi = calculateROI(account)}
              {@const winRate = calculateWinRate(account)}
              <tr class:inactive={!account.is_active}>
                <td class="account-name" on:click={() => goToAccountDetails(account.id)}>
                  <strong>{account.account_name}</strong>
                </td>
                <td>
                  <span class="strategy-badge">{getStrategyLabel(account.strategy)}</span>
                </td>
                <td>
                  <button
                    class="status-toggle"
                    class:active={account.is_active}
                    style="background: {getStatusColor(account.is_active)}"
                    on:click={() => toggleAccount(account.id)}
                  >
                    {account.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td>{formatCurrency(parseFloat(account.balance_usd))}</td>
                <td>{parseFloat(account.balance_btc).toFixed(8)} ₿</td>
                <td><strong>{formatCurrency(totalValue)}</strong></td>
                <td style="color: {getProfitColor(roi)}">
                  <strong>{roi >= 0 ? '+' : ''}{roi.toFixed(2)}%</strong>
                </td>
                <td>{winRate.toFixed(1)}%</td>
                <td>{account.total_trades || 0}</td>
                <td>
                  <div class="actions">
                    <button class="btn-view" on:click={() => goToAccountDetails(account.id)}>
                      View
                    </button>
                    <button class="btn-delete" on:click={() => deleteAccount(account.id, account.account_name)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <div class="no-accounts">
        <h3>No Accounts Yet</h3>
        <p>Create your first paper trading account to start testing strategies</p>
        <button class="btn-primary" on:click={goToCreateAccount}>
          + Create Account
        </button>
      </div>
    {/if}
  </section>

  <!-- Strategy Info -->
  <section class="info-section">
    <h2>Available Strategies ({strategies.length})</h2>
    <div class="strategies-grid">
      {#each strategies as strategy}
        <div class="strategy-info-card">
          <h3>{strategy.label}</h3>
          <p class="suggested-balance">Suggested: {formatCurrency(strategy.suggestedBalance)}</p>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  :global(body) {
    background: #f3f4f6;
  }

  .paper-trading {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
  }

  header {
    margin-bottom: 30px;
  }

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h1 {
    font-size: 36px;
    margin: 0 0 8px 0;
    color: #1f2937;
  }

  .subtitle {
    color: #6b7280;
    font-size: 16px;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .btn-primary,
  .btn-secondary {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    transition: opacity 0.2s;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-secondary {
    background: #f59e0b;
    color: white;
  }

  .btn-primary:hover,
  .btn-secondary:hover {
    opacity: 0.9;
  }

  .error-banner {
    background: #fee2e2;
    color: #991b1b;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: center;
  }

  /* Top Accounts */
  .top-accounts {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
  }

  .top-accounts h2 {
    font-size: 20px;
    margin: 0 0 20px 0;
    color: #1f2937;
  }

  .top-accounts-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .top-account-card {
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
    border-radius: 12px;
    padding: 24px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    position: relative;
  }

  .top-account-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .top-account-card.rank-1 {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 2px solid #f59e0b;
  }

  .top-account-card.rank-2 {
    background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
    border: 2px solid #6366f1;
  }

  .top-account-card.rank-3 {
    background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
    border: 2px solid #f97316;
  }

  .rank-badge {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .top-account-card h3 {
    font-size: 18px;
    margin: 0 0 4px 0;
    color: #1f2937;
  }

  .top-account-card .strategy {
    font-size: 13px;
    color: #6b7280;
    margin: 0 0 12px 0;
  }

  .roi-value {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 12px;
  }

  .account-stats {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #6b7280;
  }

  /* Accounts Section */
  .accounts-section {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
  }

  .section-header {
    margin-bottom: 20px;
  }

  .section-header h2 {
    font-size: 20px;
    margin: 0;
    color: #1f2937;
  }

  .accounts-table-container {
    overflow-x: auto;
  }

  .accounts-table {
    width: 100%;
    border-collapse: collapse;
  }

  .accounts-table th {
    background: #f9fafb;
    padding: 12px;
    text-align: left;
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e5e7eb;
  }

  .accounts-table td {
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
  }

  .accounts-table tr:hover {
    background: #f9fafb;
  }

  .accounts-table tr.inactive {
    opacity: 0.6;
  }

  .account-name {
    cursor: pointer;
    color: #3b82f6;
  }

  .account-name:hover {
    text-decoration: underline;
  }

  .strategy-badge {
    display: inline-block;
    padding: 4px 12px;
    background: #dbeafe;
    color: #1e40af;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }

  .status-toggle {
    padding: 4px 12px;
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .status-toggle:hover {
    opacity: 0.8;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .btn-view,
  .btn-delete {
    padding: 6px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-view {
    color: #3b82f6;
    border-color: #3b82f6;
  }

  .btn-view:hover {
    background: #eff6ff;
  }

  .btn-delete {
    color: #dc2626;
    border-color: #fecaca;
  }

  .btn-delete:hover {
    background: #fef2f2;
  }

  .no-accounts {
    text-align: center;
    padding: 60px;
  }

  .no-accounts h3 {
    font-size: 20px;
    margin: 0 0 8px 0;
    color: #1f2937;
  }

  .no-accounts p {
    color: #6b7280;
    margin: 0 0 20px 0;
  }

  /* Strategy Info */
  .info-section {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .info-section h2 {
    font-size: 20px;
    margin: 0 0 20px 0;
    color: #1f2937;
  }

  .strategies-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .strategy-info-card {
    background: #f9fafb;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #e5e7eb;
  }

  .strategy-info-card h3 {
    font-size: 14px;
    margin: 0 0 8px 0;
    color: #1f2937;
  }

  .suggested-balance {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
  }

  @media (max-width: 1024px) {
    .top-accounts-grid {
      grid-template-columns: 1fr;
    }

    .strategies-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }

  @media (max-width: 640px) {
    .strategies-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
