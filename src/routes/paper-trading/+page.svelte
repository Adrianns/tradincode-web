<script>
  export let data;

  let config = data.config;
  let editing = false;
  let formData = config ? { ...config } : {};

  // Calculate current portfolio value
  $: totalValue = config ? config.balanceUsd + (config.balanceBtc * data.currentPrice) : 0;
  $: profitLoss = config ? totalValue - config.initialBalance : 0;
  $: profitLossPercentage = config ? ((profitLoss / config.initialBalance) * 100) : 0;

  // Calculate win rate
  $: winRate = data.metrics.totalSells > 0
    ? (data.metrics.winningTrades / data.metrics.totalSells) * 100
    : 0;

  // Calculate HODL comparison
  $: hodlBtc = config && data.portfolioHistory.length > 0
    ? config.initialBalance / data.portfolioHistory[0].btcPrice
    : 0;
  $: hodlValue = hodlBtc * data.currentPrice;
  $: hodlProfit = hodlValue - (config?.initialBalance || 0);
  $: hodlProfitPercentage = config ? ((hodlProfit / config.initialBalance) * 100) : 0;
  $: vsHodl = profitLossPercentage - hodlProfitPercentage;

  async function toggleActive() {
    try {
      const action = config.isActive ? 'stop' : 'start';
      const response = await fetch('/api/paper-trading/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        const updated = await response.json();
        config = {
          ...config,
          isActive: updated.is_active,
          startedAt: updated.started_at
        };
        alert(config.isActive ? '✅ Paper Trading activado' : '⏸️ Paper Trading pausado');
      }
    } catch (error) {
      alert('Error al cambiar estado: ' + error.message);
    }
  }

  async function saveConfig() {
    try {
      const response = await fetch('/api/paper-trading/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          percentage_per_trade: formData.percentagePerTrade,
          buy_threshold: formData.buyThreshold,
          sell_threshold: formData.sellThreshold,
          take_profit_percentage: formData.takeProfitPercentage,
          stop_loss_percentage: formData.stopLossPercentage
        })
      });

      if (response.ok) {
        const updated = await response.json();
        config = {
          ...config,
          percentagePerTrade: updated.percentage_per_trade,
          buyThreshold: updated.buy_threshold,
          sellThreshold: updated.sell_threshold,
          takeProfitPercentage: updated.take_profit_percentage,
          stopLossPercentage: updated.stop_loss_percentage
        };
        editing = false;
        alert('✅ Configuración guardada');
      }
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    }
  }

  async function resetPaperTrading() {
    if (!confirm('¿Estás seguro? Esto borrará todo el historial de paper trading.')) {
      return;
    }

    try {
      const response = await fetch('/api/paper-trading/reset', {
        method: 'POST'
      });

      if (response.ok) {
        alert('✅ Paper Trading reiniciado');
        location.reload();
      }
    } catch (error) {
      alert('Error al reiniciar: ' + error.message);
    }
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  function formatDate(dateString) {
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
</script>

<svelte:head>
  <title>Paper Trading - Tradincode</title>
</svelte:head>

<div class="paper-trading">
  <header>
    <h1>📊 Paper Trading</h1>
    <p class="subtitle">Simulación automática de trading basado en señales</p>
  </header>

  {#if data.error}
    <div class="error-banner">⚠️ {data.error}</div>
  {/if}

  {#if config}
    <!-- Control Panel -->
    <section class="control-panel">
      <div class="status-card">
        <div class="status-header">
          <h2>Estado</h2>
          <button
            class="toggle-btn"
            class:active={config.isActive}
            on:click={toggleActive}
            style="background: {getStatusColor(config.isActive)}"
          >
            {config.isActive ? '✓ ACTIVO' : '⏸ PAUSADO'}
          </button>
        </div>

        {#if config.isActive && config.startedAt}
          <p class="started-date">
            Activo desde {formatDate(config.startedAt)}
          </p>
        {/if}
      </div>

      <div class="config-card">
        <div class="config-header">
          <h2>Configuración</h2>
          {#if !editing}
            <button class="edit-btn" on:click={() => { editing = true; formData = {...config}; }}>
              ✏️ Editar
            </button>
          {/if}
        </div>

        {#if editing}
          <form on:submit|preventDefault={saveConfig} class="config-form">
            <div class="form-row">
              <div class="form-group">
                <label>% por operación</label>
                <input type="number" bind:value={formData.percentagePerTrade} min="1" max="100" required />
              </div>
              <div class="form-group">
                <label>Umbral de compra</label>
                <input type="number" bind:value={formData.buyThreshold} min="0" max="100" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Umbral de venta</label>
                <input type="number" bind:value={formData.sellThreshold} min="0" max="100" required />
              </div>
              <div class="form-group">
                <label>Take Profit %</label>
                <input type="number" bind:value={formData.takeProfitPercentage} min="1" max="100" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Stop Loss %</label>
                <input type="number" bind:value={formData.stopLossPercentage} min="1" max="100" required />
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="save-btn">💾 Guardar</button>
              <button type="button" class="cancel-btn" on:click={() => editing = false}>
                ✖ Cancelar
              </button>
            </div>
          </form>
        {:else}
          <div class="config-display">
            <div class="config-item">
              <span class="label">Balance inicial:</span>
              <span class="value">{formatCurrency(config.initialBalance)}</span>
            </div>
            <div class="config-item">
              <span class="label">% por operación:</span>
              <span class="value">{config.percentagePerTrade}%</span>
            </div>
            <div class="config-item">
              <span class="label">Umbral compra/venta:</span>
              <span class="value">{config.buyThreshold} / {config.sellThreshold}</span>
            </div>
            <div class="config-item">
              <span class="label">Take Profit / Stop Loss:</span>
              <span class="value">{config.takeProfitPercentage}% / {config.stopLossPercentage}%</span>
            </div>
          </div>
        {/if}

        <button class="reset-btn" on:click={resetPaperTrading}>
          🔄 Reset Paper Trading
        </button>
      </div>
    </section>

    <!-- Balance Cards -->
    <section class="balance-section">
      <div class="balance-card">
        <h3>Balance USD</h3>
        <div class="balance-value">{formatCurrency(config.balanceUsd)}</div>
      </div>

      <div class="balance-card">
        <h3>Balance BTC</h3>
        <div class="balance-value">{config.balanceBtc.toFixed(8)} ₿</div>
        <div class="balance-sub">{formatCurrency(config.balanceBtc * data.currentPrice)}</div>
      </div>

      <div class="balance-card total">
        <h3>Valor Total</h3>
        <div class="balance-value">{formatCurrency(totalValue)}</div>
        <div
          class="balance-sub"
          style="color: {getProfitColor(profitLoss)}"
        >
          {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
          ({profitLoss >= 0 ? '+' : ''}{profitLossPercentage.toFixed(2)}%)
        </div>
      </div>
    </section>

    <!-- Metrics Cards -->
    <section class="metrics-section">
      <div class="metric-card">
        <div class="metric-label">Total Operaciones</div>
        <div class="metric-value">{data.metrics.totalBuys + data.metrics.totalSells}</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Win Rate</div>
        <div class="metric-value" style="color: {getProfitColor(winRate - 50)}">
          {winRate.toFixed(1)}%
        </div>
        <div class="metric-sub">
          {data.metrics.winningTrades}W / {data.metrics.losingTrades}L
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Promedio Ganancia</div>
        <div class="metric-value positive">
          {formatCurrency(data.metrics.avgWin)}
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Promedio Pérdida</div>
        <div class="metric-value negative">
          {formatCurrency(Math.abs(data.metrics.avgLoss))}
        </div>
      </div>

      <div class="metric-card highlight">
        <div class="metric-label">vs HODL</div>
        <div class="metric-value" style="color: {getProfitColor(vsHodl)}">
          {vsHodl >= 0 ? '+' : ''}{vsHodl.toFixed(2)}%
        </div>
        <div class="metric-sub">
          HODL: {hodlProfitPercentage >= 0 ? '+' : ''}{hodlProfitPercentage.toFixed(2)}%
        </div>
      </div>
    </section>

    <!-- Trades Table -->
    <section class="trades-section">
      <h2>Historial de Operaciones ({data.trades.length})</h2>

      {#if data.trades.length > 0}
        <div class="trades-table-container">
          <table class="trades-table">
            <thead>
              <tr>
                <th>Fecha/Hora</th>
                <th>Tipo</th>
                <th>Precio BTC</th>
                <th>Cantidad BTC</th>
                <th>USD</th>
                <th>Balance Resultante</th>
                <th>Score</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>
              {#each data.trades as trade}
                <tr class={trade.tradeType}>
                  <td>{formatDate(trade.createdAt)}</td>
                  <td>
                    <span class="trade-badge {trade.tradeType}">
                      {trade.tradeType === 'buy' ? '📈 COMPRA' : '📉 VENTA'}
                    </span>
                  </td>
                  <td>{formatCurrency(trade.btcPrice)}</td>
                  <td>{trade.btcAmount.toFixed(8)}</td>
                  <td>{formatCurrency(trade.usdAmount)}</td>
                  <td>
                    {formatCurrency(trade.balanceUsd)}
                    {#if trade.balanceBtc > 0}
                      <br /><small>+ {trade.balanceBtc.toFixed(8)} ₿</small>
                    {/if}
                  </td>
                  <td>
                    <span class="score-badge">{trade.scoreAtTrade}/100</span>
                  </td>
                  <td>
                    {#if trade.profitLossUsd !== null}
                      <span style="color: {getProfitColor(trade.profitLossUsd)}">
                        {trade.profitLossUsd >= 0 ? '+' : ''}{formatCurrency(trade.profitLossUsd)}
                        <br />
                        <small>
                          ({trade.profitLossPercentage >= 0 ? '+' : ''}{trade.profitLossPercentage.toFixed(2)}%)
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
        <p class="no-trades">No hay operaciones todavía. El paper trading ejecutará operaciones automáticamente según las señales del mercado.</p>
      {/if}
    </section>
  {:else}
    <div class="no-config">
      <h2>Paper Trading No Configurado</h2>
      <p>Ejecuta la migración de paper trading para comenzar:</p>
      <code>cd worker && node src/migrate-paper-trading.js</code>
    </div>
  {/if}
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
    text-align: center;
    margin-bottom: 30px;
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

  /* Control Panel */
  .control-panel {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  .status-card,
  .config-card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .status-header,
  .config-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  h2 {
    font-size: 18px;
    margin: 0;
    color: #1f2937;
  }

  .toggle-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    transition: opacity 0.2s;
  }

  .toggle-btn:hover {
    opacity: 0.9;
  }

  .started-date {
    color: #6b7280;
    font-size: 14px;
    margin: 8px 0 0 0;
  }

  .config-display {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  .config-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .config-item .label {
    color: #6b7280;
    font-size: 14px;
  }

  .config-item .value {
    color: #1f2937;
    font-weight: 600;
  }

  .edit-btn,
  .reset-btn {
    padding: 8px 16px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    color: #374151;
    cursor: pointer;
    font-size: 14px;
  }

  .edit-btn:hover,
  .reset-btn:hover {
    background: #f3f4f6;
  }

  .reset-btn {
    width: 100%;
    margin-top: 16px;
    color: #dc2626;
    border-color: #fecaca;
  }

  .reset-btn:hover {
    background: #fef2f2;
  }

  /* Form */
  .config-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
  }

  .form-group label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .form-group input {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
  }

  .form-actions {
    display: flex;
    gap: 12px;
  }

  .save-btn,
  .cancel-btn {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
  }

  .save-btn {
    background: #3b82f6;
    color: white;
  }

  .cancel-btn {
    background: #f3f4f6;
    color: #6b7280;
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

  .metric-card.highlight {
    border: 2px solid #3b82f6;
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

  .metric-sub {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 4px;
  }

  /* Trades Table */
  .trades-section {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .trades-section h2 {
    margin-bottom: 16px;
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

  .score-badge {
    display: inline-block;
    padding: 4px 8px;
    background: #f3f4f6;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
  }

  .muted {
    color: #9ca3af;
  }

  .no-trades {
    text-align: center;
    color: #9ca3af;
    padding: 40px;
  }

  .no-config {
    background: white;
    border-radius: 8px;
    padding: 60px;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .no-config code {
    background: #f3f4f6;
    padding: 8px 16px;
    border-radius: 4px;
    display: inline-block;
    margin-top: 16px;
  }

  @media (max-width: 1024px) {
    .control-panel {
      grid-template-columns: 1fr;
    }

    .balance-section {
      grid-template-columns: 1fr;
    }

    .metrics-section {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
