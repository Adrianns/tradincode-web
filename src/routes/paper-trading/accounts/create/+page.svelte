<script>
  import { goto } from '$app/navigation';
  import { enhance } from '$app/forms';

  export let data;
  export let form;

  let strategies = data.strategies || [];
  let selectedStrategy = '';
  let suggestedBalance = 1000;

  // Update suggested balance when strategy changes
  $: {
    const strategy = strategies.find(s => s.value === selectedStrategy);
    if (strategy) {
      suggestedBalance = strategy.suggestedBalance;
    }
  }

  function goBack() {
    goto('/paper-trading');
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
</script>

<svelte:head>
  <title>Create Account - Tradincode</title>
</svelte:head>

<div class="create-account">
  <header>
    <button class="back-btn" on:click={goBack}>← Back to Accounts</button>
    <h1>Create New Paper Trading Account</h1>
    <p class="subtitle">Configure a new account to test trading strategies</p>
  </header>

  {#if form?.error}
    <div class="error-banner">⚠️ {form.error}</div>
  {/if}

  <div class="form-container">
    <form method="POST" use:enhance>
      <!-- Account Name -->
      <div class="form-section">
        <h2>Account Information</h2>
        <div class="form-group">
          <label for="account_name">Account Name *</label>
          <input
            type="text"
            id="account_name"
            name="account_name"
            placeholder="e.g., Trend Shield Main"
            required
            value={form?.formData?.account_name || ''}
          />
          <span class="form-hint">Choose a unique name to identify this account</span>
        </div>

        <div class="form-group">
          <label for="strategy">Strategy *</label>
          <select
            id="strategy"
            name="strategy"
            required
            bind:value={selectedStrategy}
          >
            <option value="">Select a strategy</option>
            {#each strategies as strategy}
              <option value={strategy.value}>{strategy.label}</option>
            {/each}
          </select>
          <span class="form-hint">
            {#if selectedStrategy}
              Suggested balance: <strong>{formatCurrency(suggestedBalance)}</strong>
            {:else}
              Select a strategy to see suggested balance
            {/if}
          </span>
        </div>

        <div class="form-group">
          <label for="initial_balance">Initial Balance (USD) *</label>
          <input
            type="number"
            id="initial_balance"
            name="initial_balance"
            min="100"
            step="100"
            value={form?.formData?.initial_balance || suggestedBalance}
            required
          />
          <span class="form-hint">Starting capital for this account (minimum $100)</span>
        </div>

        <div class="form-group checkbox">
          <label>
            <input
              type="checkbox"
              name="is_active"
              checked={form?.formData?.is_active !== false}
            />
            Activate account immediately
          </label>
          <span class="form-hint">If unchecked, account will be created but inactive</span>
        </div>
      </div>

      <!-- Risk Management -->
      <div class="form-section">
        <h2>Risk Management</h2>
        <div class="form-row">
          <div class="form-group">
            <label for="position_size_percent">Position Size (%)</label>
            <input
              type="number"
              id="position_size_percent"
              name="position_size_percent"
              min="10"
              max="100"
              step="5"
              value={form?.formData?.position_size_percent * 100 || 95}
              required
            />
            <span class="form-hint">Percentage of balance to use per trade</span>
          </div>

          <div class="form-group">
            <label for="stop_loss_percent">Stop Loss (%)</label>
            <input
              type="number"
              id="stop_loss_percent"
              name="stop_loss_percent"
              min="0.1"
              max="20"
              step="0.1"
              value={form?.formData?.stop_loss_percent * 100 || 0.5}
              required
            />
            <span class="form-hint">Percentage below entry price</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="take_profit_percent">Take Profit (%) - Optional</label>
            <input
              type="number"
              id="take_profit_percent"
              name="take_profit_percent"
              min="0.1"
              max="50"
              step="0.1"
              value={form?.formData?.take_profit_percent * 100 || ''}
              placeholder="Leave empty for no TP"
            />
            <span class="form-hint">Percentage above entry price (optional)</span>
          </div>

          <div class="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="trailing_stop"
                checked={form?.formData?.trailing_stop || false}
              />
              Enable Trailing Stop
            </label>
            <span class="form-hint">Automatically adjust stop loss as price moves up</span>
          </div>
        </div>

        {#if form?.formData?.trailing_stop}
          <div class="form-group">
            <label for="trailing_stop_percent">Trailing Stop Distance (%)</label>
            <input
              type="number"
              id="trailing_stop_percent"
              name="trailing_stop_percent"
              min="0.1"
              max="20"
              step="0.1"
              value={form?.formData?.trailing_stop_percent * 100 || 1}
            />
            <span class="form-hint">Distance below highest price reached</span>
          </div>
        {/if}
      </div>

      <!-- Convergent Strategy Settings -->
      {#if selectedStrategy === 'convergent'}
        <div class="form-section">
          <h2>Convergent Signals Settings</h2>
          <div class="form-group">
            <label for="required_convergence">Required Convergence</label>
            <select
              id="required_convergence"
              name="required_convergence"
              value={form?.formData?.required_convergence || 2}
            >
              <option value="1">1 indicator (very aggressive)</option>
              <option value="2">2 indicators (balanced)</option>
              <option value="3">3 indicators (conservative)</option>
              <option value="4">4 indicators (very conservative)</option>
            </select>
            <span class="form-hint">Number of indicators that must agree for a signal</span>
          </div>
        </div>
      {/if}

      <!-- Actions -->
      <div class="form-actions">
        <button type="button" class="btn-cancel" on:click={goBack}>Cancel</button>
        <button type="submit" class="btn-submit">Create Account</button>
      </div>
    </form>
  </div>
</div>

<style>
  :global(body) {
    background: #f3f4f6;
  }

  .create-account {
    max-width: 800px;
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
    font-size: 32px;
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

  .form-container {
    background: white;
    border-radius: 8px;
    padding: 32px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .form-section {
    margin-bottom: 32px;
    padding-bottom: 32px;
    border-bottom: 1px solid #e5e7eb;
  }

  .form-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .form-section h2 {
    font-size: 18px;
    margin: 0 0 20px 0;
    color: #1f2937;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
  }

  .form-group input[type="text"],
  .form-group input[type="number"],
  .form-group select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .form-group.checkbox {
    display: flex;
    flex-direction: column;
  }

  .form-group.checkbox label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: normal;
  }

  .form-group.checkbox input[type="checkbox"] {
    width: auto;
    margin-right: 8px;
    cursor: pointer;
  }

  .form-hint {
    display: block;
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    margin-top: 32px;
    padding-top: 32px;
    border-top: 1px solid #e5e7eb;
  }

  .btn-cancel,
  .btn-submit {
    flex: 1;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    transition: opacity 0.2s;
  }

  .btn-cancel {
    background: #f3f4f6;
    color: #6b7280;
  }

  .btn-submit {
    background: #3b82f6;
    color: white;
  }

  .btn-cancel:hover,
  .btn-submit:hover {
    opacity: 0.9;
  }

  @media (max-width: 640px) {
    .form-row {
      grid-template-columns: 1fr;
    }

    .form-container {
      padding: 20px;
    }
  }
</style>
