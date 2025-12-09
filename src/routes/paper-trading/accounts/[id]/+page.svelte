<script>
  import { goto } from '$app/navigation';
  import { enhance } from '$app/forms';

  export let data;
  export let form;

  let account = data.account;
  let trades = data.trades || [];
  let snapshots = data.snapshots || [];
  let metrics = data.metrics;

  // TODO: Get current BTC price from API
  $: currentBtcPrice = 95000;

  $: totalValue = parseFloat(account.balance_usd) + (parseFloat(account.balance_btc) * currentBtcPrice);
  $: roi = ((totalValue - parseFloat(account.initial_balance)) / parseFloat(account.initial_balance)) * 100;

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

  function getStatusColor(isActive) {
    return isActive ? '#22c55e' : '#9ca3af';
  }

  function getProfitColor(value) {
    if (value > 0) return '#22c55e';
    if (value < 0) return '#ef4444';
    return '#6b7280';
  }

  function goBack() {
    goto('/paper-trading');
  }

  async function handleToggle() {
    if (confirm(`Are you sure you want to ${account.is_active ? 'deactivate' : 'activate'} this account?`)) {
      // Form will handle the toggle via action
    }
  }

  async function handleDelete() {
    if (confirm(`Are you sure you want to delete "${account.account_name}"? This action cannot be undone.`)) {
      // Form will handle the delete via action
    }
  }
</script>

<svelte:head>
  <title>{account.account_name} - Tradincode</title>
</svelte:head>

<div class="account-details">
  <header>
    <button class="back-btn" on:click={goBack}>← Back to Accounts</button>

    <div class="header-content">
      <div class="header-info">
        <h1>{account.account_name}</h1>
        <p class="strategy">{account.strategy}</p>
      </div>

      <div class="header-actions">
        <form method="POST" action="?/toggle" use:enhance on:submit={handleToggle}>
          <button
            type="submit"
            class="status-toggle"
            style="background: {getStatusColor(account.is_active)}"
          >
            {account.is_active ? '✓ Active' : '⏸ Inactive'}
          </button>
        </form>

        <form method="POST" action="?/delete" use:enhance on:submit={handleDelete}>
          <button type="submit" class="btn-delete">🗑️ Delete Account</button>
        </form>
      </div>
    </div>
  </header>

  {#if form?.error}
    <div class="error-banner">⚠️ {form.error}</div>
  {/if}

  <!-- Balance Cards -->
  <section class="balance-section">
    <div class="balance-card">
      <h3>Balance USD</h3>
      <div class="balance-value">{formatCurrency(parseFloat(account.balance_usd))}</div>
    </div>

    <div class="balance-card">
      <h3>Balance BTC</h3>
      <div class="balance-value">{parseFloat(account.balance_btc).toFixed(8)} ₿</div>
      <div class="balance-sub">{formatCurrency(parseFloat(account.balance_btc) * currentBtcPrice)}</div>
    </div>

    <div class="balance-card total">
      <h3>Total Value</h3>
      <div class="balance-value">{formatCurrency(totalValue)}</div>
      <div class="balance-sub" style="color: {getProfitColor(roi)}">
        {roi >= 0 ? '+' : ''}{roi.toFixed(2)}% ROI
      </div>
    </div>
  </section>

  <!-- Metrics -->
  <section class="metrics-section">
    <div class="metric-card">
      <div class="metric-label">Total Trades</div>
      <div class="metric-value">{metrics.totalTrades}</div>
    </div>

    <div class="metric-card">
      <div class="metric-label">Winning Trades</div>
      <div class="metric-value positive">{metrics.winningTrades}</div>
    </div>

    <div class="metric-card">
      <div class="metric-label">Losing Trades</div>
      <div class="metric-value negative">{metrics.losingTrades}</div>
    </div>

    <div class="metric-card">
      <div class="metric-label">Win Rate</div>
      <div class="metric-value" style="color: {getProfitColor(metrics.winRate - 50)}">
        {metrics.winRate.toFixed(1)}%
      </div>
    </div>

    <div class="metric-card">
      <div class="metric-label">Total P&L</div>
      <div class="metric-value" style="color: {getProfitColor(metrics.totalProfitLoss)}">
        {metrics.totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(metrics.totalProfitLoss)}
      </div>
    </div>
  </section>

  <!-- Configuration -->
  <section class="config-section">
    <h2>Configuration</h2>
    <div class="config-grid">
      <div class="config-item">
        <span class="label">Initial Balance</span>
        <span class="value">{formatCurrency(parseFloat(account.initial_balance))}</span>
      </div>
      <div class="config-item">
        <span class="label">Position Size</span>
        <span class="value">{(parseFloat(account.position_size_percent) * 100).toFixed(0)}%</span>
      </div>
      <div class="config-item">
        <span class="label">Stop Loss</span>
        <span class="value">{(parseFloat(account.stop_loss_percent) * 100).toFixed(2)}%</span>
      </div>
      {#if account.take_profit_percent}
        <div class="config-item">
          <span class="label">Take Profit</span>
          <span class="value">{(parseFloat(account.take_profit_percent) * 100).toFixed(2)}%</span>
        </div>
      {/if}
      {#if account.required_convergence}
        <div class="config-item">
          <span class="label">Required Convergence</span>
          <span class="value">{account.required_convergence} indicators</span>
        </div>
      {/if}
    </div>
  </section>

  <!-- Balance History Chart -->
  {#if snapshots.length > 0}
    <section class="chart-section">
      <h2>Balance Evolution</h2>
      <div class="chart-placeholder">
        <p>Chart with {snapshots.length} data points</p>
        <p class="chart-note">Balance tracking over time (chart visualization coming soon)</p>
      </div>
    </section>
  {/if}

  <!-- Trade History -->
  <section class="trades-section">
    <h2>Trade History ({trades.length})</h2>

    {#if trades.length > 0}
      <div class="trades-table-container">
        <table class="trades-table">
          <thead>
            <tr>
              <th>Date/Time</th>
              <th>Type</th>
              <th>BTC Price</th>
              <th>BTC Amount</th>
              <th>USD Amount</th>
              <th>Balance After</th>
              <th>P&L</th>
            </tr>
          </thead>
          <tbody>
            {#each trades as trade}
              <tr class={trade.trade_type}>
                <td>{formatDate(trade.created_at)}</td>
                <td>
                  <span class="trade-badge {trade.trade_type}">
                    {trade.trade_type === 'buy' ? '📈 BUY' : '📉 SELL'}
                  </span>
                </td>
                <td>{formatCurrency(parseFloat(trade.btc_price))}</td>
                <td>{parseFloat(trade.btc_amount).toFixed(8)}</td>
                <td>{formatCurrency(parseFloat(trade.usd_amount))}</td>
                <td>
                  {formatCurrency(parseFloat(trade.balance_usd))}
                  {#if parseFloat(trade.balance_btc) > 0}
                    <br /><small>+ {parseFloat(trade.balance_btc).toFixed(8)} ₿</small>
                  {/if}
                </td>
                <td>
                  {#if trade.profit_loss_usd}
                    <span style="color: {getProfitColor(parseFloat(trade.profit_loss_usd))}">
                      {parseFloat(trade.profit_loss_usd) >= 0 ? '+' : ''}{formatCurrency(parseFloat(trade.profit_loss_usd))}
                      <br />
                      <small>
                        ({parseFloat(trade.profit_loss_percentage) >= 0 ? '+' : ''}{parseFloat(trade.profit_loss_percentage).toFixed(2)}%)
                      </small>
                    </span>
                  {:else}
                    <span class="muted">-</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <p class="no-trades">No trades yet. Wait for the next analysis cycle or activate the account.</p>
    {/if}
  </section>
</div>

<style>
  :global(body) {
    background: #f3f4f6;
  }

  .account-details {
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

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-info h1 {
    font-size: 32px;
    margin: 0 0 4px 0;
    color: #1f2937;
  }

  .header-info .strategy {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }

  .status-toggle,
  .btn-delete {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    transition: opacity 0.2s;
  }

  .status-toggle {
    color: white;
  }

  .status-toggle:hover {
    opacity: 0.9;
  }

  .btn-delete {
    background: #fee2e2;
    color: #dc2626;
  }

  .btn-delete:hover {
    background: #fecaca;
  }

  .error-banner {
    background: #fee2e2;
    color: #991b1b;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: center;
  }

  /* Balance Section */
  .balance-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 20px;
  }

  .balance-card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .balance-card.total {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
  }

  .balance-card h3 {
    font-size: 14px;
    margin: 0 0 12px 0;
    opacity: 0.8;
  }

  .balance-card.total h3 {
    color: white;
  }

  .balance-value {
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .balance-sub {
    font-size: 14px;
    opacity: 0.8;
  }

  /* Metrics Section */
  .metrics-section {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .metric-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .metric-label {
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .metric-value {
    font-size: 24px;
    font-weight: bold;
    color: #1f2937;
  }

  .metric-value.positive {
    color: #22c55e;
  }

  .metric-value.negative {
    color: #ef4444;
  }

  /* Config Section */
  .config-section {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }

  .config-section h2 {
    font-size: 18px;
    margin: 0 0 16px 0;
    color: #1f2937;
  }

  .config-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .config-item {
    display: flex;
    flex-direction: column;
    padding: 12px;
    background: #f9fafb;
    border-radius: 6px;
  }

  .config-item .label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 4px;
  }

  .config-item .value {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  /* Chart Section */
  .chart-section {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }

  .chart-section h2 {
    font-size: 18px;
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
  }

  .chart-note {
    font-size: 13px;
    color: #9ca3af;
  }

  /* Trades Section */
  .trades-section {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .trades-section h2 {
    margin-bottom: 16px;
    font-size: 18px;
    color: #1f2937;
  }

  .trades-table-container {
    overflow-x: auto;
  }

  .trades-table {
    width: 100%;
    border-collapse: collapse;
  }

  .trades-table th {
    background: #f9fafb;
    padding: 12px;
    text-align: left;
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e5e7eb;
  }

  .trades-table td {
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
  }

  .trades-table tr.buy {
    background: #f0fdf4;
  }

  .trades-table tr.sell {
    background: #eff6ff;
  }

  .trade-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }

  .trade-badge.buy {
    background: #22c55e;
    color: white;
  }

  .trade-badge.sell {
    background: #3b82f6;
    color: white;
  }

  .muted {
    color: #9ca3af;
  }

  .no-trades {
    text-align: center;
    color: #9ca3af;
    padding: 40px;
  }

  @media (max-width: 1024px) {
    .balance-section {
      grid-template-columns: 1fr;
    }

    .metrics-section {
      grid-template-columns: repeat(2, 1fr);
    }

    .config-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }
</style>
