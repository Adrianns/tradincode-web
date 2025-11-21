import { json } from '@sveltejs/kit';
import {
  getPaperConfig,
  updatePaperConfig,
  startPaperTrading,
  stopPaperTrading
} from '$lib/paper-trading-db.js';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
  try {
    const config = await getPaperConfig();
    return json(config);
  } catch (error) {
    console.error('Error fetching paper trading config:', error);
    return json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const body = await request.json();
    const { action, initial_balance, ...updates } = body;

    let result;

    if (action === 'start') {
      result = await startPaperTrading(initial_balance);
    } else if (action === 'stop') {
      result = await stopPaperTrading();
    } else {
      result = await updatePaperConfig(updates);
    }

    return json(result);
  } catch (error) {
    console.error('Error updating paper trading config:', error);
    return json({ error: 'Failed to update config' }, { status: 500 });
  }
}
