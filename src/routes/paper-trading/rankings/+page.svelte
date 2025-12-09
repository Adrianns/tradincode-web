<script>
  import { goto } from '$app/navigation';

  export let data;

  let rankings = data.rankings || [];
  let accounts = data.accounts || [];
  let snapshotsData = data.snapshotsData || [];

  // Get top 3
  $: top3 = rankings.slice(0, 3);

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function getProfitColor(value) {
    if (value > 0) return '#22c55e';
    if (value < 0) return '#ef4444';
    return '#6b7280';
  }

  function goBack() {
    goto('/paper-trading');
  }

  function goToAccount(accountId) {
    goto(`/paper-trading/accounts/${accountId}`);
  }
</script>

<svelte:head>
  <title>Rankings - Tradincode</title>
</svelte:head>

<div class="rankings">
  <header>
    <button class="back-btn" on:click={goBack}>← Back to Accounts</button>
    <h1>🏆 Strategy Rankings</h1>
    <p class="subtitle">Performance leaderboard across all accounts</p>
  </header>

  {#if data.error}
    <div class="error-banner">⚠️ {data.error}</div>
  {/if}

  {#if rankings.length === 0}
    <div class="no-rankings">
      <h3>No Rankings Yet</h3>
      <p>Create and activate accounts to start seeing performance rankings</p>
      <button class="btn-primary" on:click={goBack}>Go to Accounts</button>
    </div>
  {:else}
    <!-- Podium (Top 3) -->
    <section class="podium-section">
      <h2>Top Performers</h2>
      <div class="podium">
        {#each top3 as rank, index}
          <div class="podium-card rank-{index + 1}" on:click={() => goToAccount(rank.account_id)}>
            <div class="podium-rank">
              {#if index === 0}
                <div class="medal gold">🥇</div>
              {:else if index === 1}
                <div class="medal silver">🥈</div>
              {:else}
                <div class="medal bronze">🥉</div>
              {/if}
            </div>
            <h3>{rank.account_name}</h3>
            <p class="strategy">{rank.strategy}</p>
            <div class="roi-value" style="color: {getProfitColor(parseFloat(rank.roi_percent))}">
              {parseFloat(rank.roi_percent) >= 0 ? '+' : ''}{parseFloat(rank.roi_percent).toFixed(2)}%
            </div>
            <div class="podium-stats">
              <div class="stat">
                <span class="stat-label">Win Rate</span>
                <span class="stat-value">{parseFloat(rank.win_rate).toFixed(1)}%</span>
              </div>
              <div class="stat">
                <span class="stat-label">Trades</span>
                <span class="stat-value">{rank.total_trades}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Full Rankings Table -->
    <section class="rankings-table-section">
      <h2>Complete Rankings</h2>
      <div class="rankings-table-container">
        <table class="rankings-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Account</th>
              <th>Strategy</th>
              <th>ROI</th>
              <th>Win Rate</th>
              <th>Total Trades</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {#each rankings as rank, index}
              <tr on:click={() => goToAccount(rank.account_id)} class:top3={index < 3}>
                <td class="rank-cell">
                  <span class="rank-badge rank-{index + 1}">#{rank.rank}</span>
                </td>
                <td><strong>{rank.account_name}</strong></td>
                <td>
                  <span class="strategy-badge">{rank.strategy}</span>
                </td>
                <td style="color: {getProfitColor(parseFloat(rank.roi_percent))}">
                  <strong>{parseFloat(rank.roi_percent) >= 0 ? '+' : ''}{parseFloat(rank.roi_percent).toFixed(2)}%</strong>
                </td>
                <td>{parseFloat(rank.win_rate).toFixed(1)}%</td>
                <td>{rank.total_trades}</td>
                <td>{formatCurrency(parseFloat(rank.balance_usd))}</td>
                <td>
                  <span class="status-badge" class:active={rank.is_active}>
                    {rank.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Comparison Chart Placeholder -->
    {#if snapshotsData.length > 0}
      <section class="chart-section">
        <h2>Performance Comparison</h2>
        <div class="chart-placeholder">
          <p>Tracking {snapshotsData.length} account(s) over time</p>
          <p class="chart-note">Multi-line chart comparing all accounts (visualization coming soon)</p>
        </div>
      </section>
    {/if}
  {/if}
</div>

<style>
  :global(body) {
    background: #f3f4f6;
  }

  .rankings {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
  }

  header {
    margin-bottom: 30px;
  }

  .back-btn {
    background: none;
    border: none;
    color: #3b82f6;
    cursor: pointer;
    font-size: 14px;
    margin-bottom: 12px;
    padding: 0;
  }

  .back-btn:hover {
    text-decoration: underline;
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

  .error-banner {
    background: #fee2e2;
    color: #991b1b;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: center;
  }

  .no-rankings {
    background: white;
    border-radius: 8px;
    padding: 60px;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .no-rankings h3 {
    font-size: 20px;
    margin: 0 0 8px 0;
    color: #1f2937;
  }

  .no-rankings p {
    color: #6b7280;
    margin: 0 0 20px 0;
  }

  .btn-primary {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    background: #3b82f6;
    color: white;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
  }

  .btn-primary:hover {
    opacity: 0.9;
  }

  /* Podium Section */
  .podium-section {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
  }

  .podium-section h2 {
    font-size: 20px;
    margin: 0 0 20px 0;
    color: #1f2937;
  }

  .podium {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .podium-card {
    border-radius: 12px;
    padding: 24px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    text-align: center;
  }

  .podium-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .podium-card.rank-1 {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 3px solid #f59e0b;
  }

  .podium-card.rank-2 {
    background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
    border: 3px solid #6366f1;
  }

  .podium-card.rank-3 {
    background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
    border: 3px solid #f97316;
  }

  .podium-rank {
    margin-bottom: 12px;
  }

  .medal {
    font-size: 48px;
  }

  .podium-card h3 {
    font-size: 18px;
    margin: 0 0 4px 0;
    color: #1f2937;
  }

  .podium-card .strategy {
    font-size: 13px;
    color: #6b7280;
    margin: 0 0 12px 0;
  }

  .roi-value {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 16px;
  }

  .podium-stats {
    display: flex;
    justify-content: space-around;
    gap: 16px;
  }

  .stat {
    display: flex;
    flex-direction: column;
  }

  .stat-label {
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  /* Rankings Table */
  .rankings-table-section {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 24px;
  }

  .rankings-table-section h2 {
    font-size: 20px;
    margin: 0 0 20px 0;
    color: #1f2937;
  }

  .rankings-table-container {
    overflow-x: auto;
  }

  .rankings-table {
    width: 100%;
    border-collapse: collapse;
  }

  .rankings-table th {
    background: #f9fafb;
    padding: 12px;
    text-align: left;
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e5e7eb;
  }

  .rankings-table td {
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
  }

  .rankings-table tbody tr {
    cursor: pointer;
    transition: background 0.2s;
  }

  .rankings-table tbody tr:hover {
    background: #f9fafb;
  }

  .rankings-table tbody tr.top3 {
    background: #fffbeb;
  }

  .rank-cell {
    text-align: center;
  }

  .rank-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
  }

  .rank-badge.rank-1 {
    background: #fef3c7;
    color: #92400e;
  }

  .rank-badge.rank-2 {
    background: #e0e7ff;
    color: #3730a3;
  }

  .rank-badge.rank-3 {
    background: #fed7aa;
    color: #9a3412;
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

  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    background: #f3f4f6;
    color: #6b7280;
  }

  .status-badge.active {
    background: #dcfce7;
    color: #166534;
  }

  /* Chart Section */
  .chart-section {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .chart-section h2 {
    font-size: 20px;
    margin: 0 0 16px 0;
    color: #1f2937;
  }

  .chart-placeholder {
    background: #f9fafb;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    padding: 60px;
    text-align: center;
    color: #6b7280;
  }

  .chart-placeholder p {
    margin: 0 0 8px 0;
    font-size: 16px;
  }

  .chart-note {
    font-size: 13px;
    color: #9ca3af;
  }

  @media (max-width: 1024px) {
    .podium {
      grid-template-columns: 1fr;
    }
  }
</style>
