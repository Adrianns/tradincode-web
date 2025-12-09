import { api } from '$lib/api/client.js';
import { redirect } from '@sveltejs/kit';

export async function load() {
  try {
    const strategies = await api.getStrategies();
    return { strategies };
  } catch (error) {
    console.error('Error loading strategies:', error);
    return {
      strategies: [],
      error: error.message
    };
  }
}

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    const accountData = {
      account_name: data.get('account_name'),
      strategy: data.get('strategy'),
      initial_balance: parseFloat(data.get('initial_balance')),
      is_active: data.get('is_active') === 'on',
      position_size_percent: parseFloat(data.get('position_size_percent')) / 100,
      stop_loss_percent: parseFloat(data.get('stop_loss_percent')) / 100,
      take_profit_percent: data.get('take_profit_percent')
        ? parseFloat(data.get('take_profit_percent')) / 100
        : null,
      trailing_stop: data.get('trailing_stop') === 'on',
      trailing_stop_percent: data.get('trailing_stop_percent')
        ? parseFloat(data.get('trailing_stop_percent')) / 100
        : null,
      required_convergence: data.get('strategy') === 'convergent'
        ? parseInt(data.get('required_convergence'))
        : null
    };

    try {
      await api.createAccount(accountData);
      throw redirect(303, '/paper-trading');
    } catch (error) {
      if (error.status === 303) throw error; // Re-throw redirect
      return {
        error: error.message,
        formData: accountData
      };
    }
  }
};
