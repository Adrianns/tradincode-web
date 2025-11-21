<script>
  import PriceChart from '$lib/components/PriceChart.svelte';
  import ScoreGauge from '$lib/components/ScoreGauge.svelte';
  import ScoreChart from '$lib/components/ScoreChart.svelte';

  export let data;

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  function getAlertEmoji(type) {
    const emojiMap = {
      'SCORE_CHANGE': '📊',
      'GOLDEN_CROSS': '🟢',
      'DEATH_CROSS': '🔴',
      'MA200_TOUCH': '🎯',
      'RSI_OVERSOLD': '🟢',
      'RSI_OVERBOUGHT': '🔴'
    };
    return emojiMap[type] || '🔔';
  }

  function getIndicatorColor(value, type) {
    if (type === 'rsi') {
      if (value < 30) return '#22c55e'; // green - oversold
      if (value > 70) return '#ef4444'; // red - overbought
      return '#eab308'; // yellow - neutral
    }
    if (type === 'macd') {
      return value > 0 ? '#22c55e' : '#ef4444';
    }
    return '#6b7280';
  }
</script>

<svelte:head>
  <title>Tradincode - Bitcoin Investment Monitor</title>
</svelte:head>

<div class="dashboard">
  <header>
    <div class="header-content">
      <div>
        <h1>📈 Tradincode</h1>
        <p class="subtitle">Bitcoin Long-Term Investment Monitor</p>
      </div>
      <a href="/paper-trading" class="paper-trading-link">
        📊 Paper Trading
      </a>
    </div>
  </header>

  {#if data.error}
    <div class="error-banner">
      ⚠️ {data.error}
    </div>
  {/if}

  {#if data.latest}
    <!-- Current Status -->
    <section class="current-status">
      <div class="price-card">
        <h2>Current Price</h2>
        <div class="price-value">{formatPrice(data.latest.price)}</div>
        <div class="timestamp">
          Last updated: {formatDate(data.latest.timestamp)}
        </div>
      </div>

      <div class="indicators-card">
        <h2>Technical Indicators</h2>
        <div class="indicators-grid">
          <div class="indicator">
            <div class="indicator-label">MA50</div>
            <div class="indicator-value">
              {data.latest.ma50 ? formatPrice(data.latest.ma50) : 'N/A'}
            </div>
          </div>
          <div class="indicator">
            <div class="indicator-label">MA200</div>
            <div class="indicator-value">
              {data.latest.ma200 ? formatPrice(data.latest.ma200) : 'N/A'}
            </div>
          </div>
          <div class="indicator">
            <div class="indicator-label">RSI Weekly</div>
            <div
              class="indicator-value"
              style="color: {data.latest.rsiWeekly ? getIndicatorColor(data.latest.rsiWeekly, 'rsi') : '#6b7280'}"
            >
              {data.latest.rsiWeekly ? data.latest.rsiWeekly.toFixed(2) : 'N/A'}
            </div>
          </div>
          <div class="indicator">
            <div class="indicator-label">MACD Weekly</div>
            <div
              class="indicator-value"
              style="color: {data.latest.macdWeekly ? getIndicatorColor(data.latest.macdWeekly, 'macd') : '#6b7280'}"
            >
              {data.latest.macdWeekly ? data.latest.macdWeekly.toFixed(2) : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Score Gauge -->
    <section class="score-section">
      <ScoreGauge score={data.latest.score} />
    </section>

    <!-- Charts -->
    <section class="charts-section">
      <PriceChart data={data.historical} />
      <ScoreChart data={data.historical} />
    </section>

    <!-- Recent Alerts -->
    <section class="alerts-section">
      <h2>Recent Alerts</h2>
      {#if data.alerts && data.alerts.length > 0}
        <div class="alerts-table">
          {#each data.alerts as alert}
            <div class="alert-row">
              <div class="alert-emoji">{getAlertEmoji(alert.type)}</div>
              <div class="alert-content">
                <div class="alert-message">{alert.message}</div>
                <div class="alert-meta">
                  {formatDate(alert.timestamp)}
                  {#if alert.score}
                    · Score: {alert.score}/100
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="no-alerts">No alerts yet</p>
      {/if}
    </section>
  {:else}
    <div class="no-data-message">
      <h2>No Data Available</h2>
      <p>Waiting for first analysis to complete...</p>
      <p class="hint">The worker runs every 4 hours to collect and analyze Bitcoin data.</p>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: #f3f4f6;
    color: #1f2937;
  }

  .dashboard {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  header {
    margin-bottom: 40px;
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

  .paper-trading-link {
    padding: 12px 24px;
    background: #3b82f6;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    transition: background 0.2s;
  }

  .paper-trading-link:hover {
    background: #2563eb;
  }

  .error-banner {
    background: #fee2e2;
    color: #991b1b;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: center;
  }

  .current-status {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  .price-card,
  .indicators-card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  h2 {
    font-size: 18px;
    margin: 0 0 16px 0;
    color: #1f2937;
  }

  .price-value {
    font-size: 48px;
    font-weight: bold;
    color: #3b82f6;
    margin: 16px 0;
  }

  .timestamp {
    color: #9ca3af;
    font-size: 14px;
  }

  .indicators-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .indicator {
    text-align: center;
  }

  .indicator-label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .indicator-value {
    font-size: 20px;
    font-weight: 600;
  }

  .score-section {
    margin-bottom: 20px;
  }

  .charts-section {
    display: grid;
    gap: 20px;
    margin-bottom: 20px;
  }

  .alerts-section {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .alerts-table {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .alert-row {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: #f9fafb;
    border-radius: 6px;
    border-left: 3px solid #3b82f6;
  }

  .alert-emoji {
    font-size: 24px;
  }

  .alert-content {
    flex: 1;
  }

  .alert-message {
    font-size: 14px;
    color: #1f2937;
    margin-bottom: 4px;
  }

  .alert-meta {
    font-size: 12px;
    color: #9ca3af;
  }

  .no-alerts {
    text-align: center;
    color: #9ca3af;
    padding: 40px 0;
  }

  .no-data-message {
    background: white;
    border-radius: 8px;
    padding: 60px;
    text-align: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .no-data-message h2 {
    margin: 0 0 16px 0;
  }

  .no-data-message p {
    color: #6b7280;
    margin: 8px 0;
  }

  .hint {
    font-size: 14px;
    color: #9ca3af;
  }

  @media (max-width: 768px) {
    .current-status {
      grid-template-columns: 1fr;
    }

    .indicators-grid {
      grid-template-columns: 1fr;
    }

    h1 {
      font-size: 28px;
    }

    .price-value {
      font-size: 36px;
    }
  }
</style>
