<script>
  export let data = [];

  // Simple line chart implementation
  function getChartData() {
    if (!data || data.length === 0) return { points: '', viewBox: '0 0 100 100' };

    const prices = data.map(d => d.price);
    const ma50s = data.map(d => d.ma50).filter(v => v !== null);
    const ma200s = data.map(d => d.ma200).filter(v => v !== null);

    const allValues = [...prices, ...ma50s, ...ma200s];
    const maxPrice = Math.max(...allValues);
    const minPrice = Math.min(...allValues);
    const priceRange = maxPrice - minPrice;

    const width = 800;
    const height = 300;
    const padding = 20;

    // Generate points for price line
    const pricePoints = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.price - minPrice) / priceRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    // Generate points for MA50
    const ma50Points = data.map((d, i) => {
      if (!d.ma50) return null;
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.ma50 - minPrice) / priceRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).filter(p => p !== null).join(' ');

    // Generate points for MA200
    const ma200Points = data.map((d, i) => {
      if (!d.ma200) return null;
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.ma200 - minPrice) / priceRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).filter(p => p !== null).join(' ');

    return {
      pricePoints,
      ma50Points,
      ma200Points,
      viewBox: `0 0 ${width} ${height}`,
      maxPrice: maxPrice.toFixed(0),
      minPrice: minPrice.toFixed(0)
    };
  }

  $: chartData = getChartData();
</script>

<div class="chart-container">
  <h3>BTC Price + Moving Averages (30 Days)</h3>
  {#if data && data.length > 0}
    <svg viewBox={chartData.viewBox} class="price-chart">
      <!-- MA200 line (red) -->
      {#if chartData.ma200Points}
        <polyline
          points={chartData.ma200Points}
          fill="none"
          stroke="#ef4444"
          stroke-width="2"
        />
      {/if}

      <!-- MA50 line (orange) -->
      {#if chartData.ma50Points}
        <polyline
          points={chartData.ma50Points}
          fill="none"
          stroke="#f59e0b"
          stroke-width="2"
        />
      {/if}

      <!-- Price line (blue) -->
      <polyline
        points={chartData.pricePoints}
        fill="none"
        stroke="#3b82f6"
        stroke-width="3"
      />
    </svg>

    <div class="legend">
      <span class="legend-item">
        <span class="legend-color" style="background: #3b82f6;"></span>
        Price
      </span>
      <span class="legend-item">
        <span class="legend-color" style="background: #f59e0b;"></span>
        MA50
      </span>
      <span class="legend-item">
        <span class="legend-color" style="background: #ef4444;"></span>
        MA200
      </span>
    </div>
  {:else}
    <p class="no-data">No historical data available</p>
  {/if}
</div>

<style>
  .chart-container {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  h3 {
    margin: 0 0 15px 0;
    font-size: 18px;
    color: #1f2937;
  }

  .price-chart {
    width: 100%;
    height: 300px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
  }

  .legend {
    display: flex;
    gap: 20px;
    margin-top: 10px;
    justify-content: center;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #6b7280;
  }

  .legend-color {
    width: 24px;
    height: 3px;
    border-radius: 2px;
  }

  .no-data {
    text-align: center;
    color: #9ca3af;
    padding: 60px 0;
  }
</style>
