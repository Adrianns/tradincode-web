<script>
  export let data = [];

  function getChartData() {
    if (!data || data.length === 0) return { points: '', viewBox: '0 0 100 100' };

    const width = 800;
    const height = 200;
    const padding = 20;

    // Generate points for score line
    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - (d.score / 100) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    return {
      points,
      viewBox: `0 0 ${width} ${height}`
    };
  }

  $: chartData = getChartData();
</script>

<div class="chart-container">
  <h3>Score History (30 Days)</h3>
  {#if data && data.length > 0}
    <svg viewBox={chartData.viewBox} class="score-chart">
      <!-- Background zones -->
      <rect x="0" y="0" width="800" height="60" fill="#fee2e2" opacity="0.3" />
      <rect x="0" y="60" width="800" height="120" fill="#fef3c7" opacity="0.3" />
      <rect x="0" y="180" width="800" height="60" fill="#dcfce7" opacity="0.3" />

      <!-- Zone labels -->
      <text x="10" y="30" font-size="12" fill="#991b1b">Caution (0-39)</text>
      <text x="10" y="120" font-size="12" fill="#854d0e">Neutral (40-69)</text>
      <text x="10" y="210" font-size="12" fill="#166534">Accumulation (70-100)</text>

      <!-- Score line -->
      <polyline
        points={chartData.points}
        fill="none"
        stroke="#3b82f6"
        stroke-width="3"
      />

      <!-- Data points -->
      {#each data as d, i}
        {@const x = 20 + (i / (data.length - 1)) * 760}
        {@const y = 180 - (d.score / 100) * 160}
        <circle cx={x} cy={y} r="3" fill="#3b82f6" />
      {/each}
    </svg>
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

  .score-chart {
    width: 100%;
    height: 200px;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
  }

  .no-data {
    text-align: center;
    color: #9ca3af;
    padding: 60px 0;
  }
</style>
