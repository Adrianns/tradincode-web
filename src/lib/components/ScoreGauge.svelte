<script>
  export let score = 0;

  function getScoreColor(score) {
    if (score >= 70) return '#22c55e'; // green
    if (score >= 40) return '#eab308'; // yellow
    return '#ef4444'; // red
  }

  function getScoreZone(score) {
    if (score >= 70) return 'ACCUMULATION ZONE';
    if (score >= 40) return 'NEUTRAL ZONE';
    return 'CAUTION ZONE';
  }

  function getScoreAdvice(score) {
    if (score >= 70) return 'Favorable conditions for DCA';
    if (score >= 40) return 'Wait for better opportunity';
    return 'Unfavorable conditions';
  }

  $: color = getScoreColor(score);
  $: zone = getScoreZone(score);
  $: advice = getScoreAdvice(score);
  $: percentage = Math.min(100, Math.max(0, score));
</script>

<div class="score-gauge">
  <h3>Investment Score</h3>

  <div class="gauge-container">
    <div class="score-display">
      <div class="score-number" style="color: {color}">
        {score}<span class="score-total">/100</span>
      </div>
      <div class="score-zone" style="color: {color}">
        {zone}
      </div>
    </div>

    <div class="progress-bar">
      <div
        class="progress-fill"
        style="width: {percentage}%; background-color: {color};"
      ></div>
    </div>

    <div class="score-advice">
      {advice}
    </div>
  </div>
</div>

<style>
  .score-gauge {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  h3 {
    margin: 0 0 20px 0;
    font-size: 18px;
    color: #1f2937;
  }

  .gauge-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .score-display {
    text-align: center;
  }

  .score-number {
    font-size: 48px;
    font-weight: bold;
    line-height: 1;
  }

  .score-total {
    font-size: 24px;
    opacity: 0.6;
  }

  .score-zone {
    font-size: 14px;
    font-weight: 600;
    margin-top: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .progress-bar {
    width: 100%;
    height: 20px;
    background: #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    transition: width 0.3s ease, background-color 0.3s ease;
    border-radius: 10px;
  }

  .score-advice {
    text-align: center;
    color: #6b7280;
    font-size: 14px;
  }
</style>
