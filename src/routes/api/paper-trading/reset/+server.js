import { json } from '@sveltejs/kit';
import { resetPaperTrading } from '$lib/paper-trading-db.js';

/** @type {import('./$types').RequestHandler} */
export async function POST() {
  try {
    await resetPaperTrading();
    return json({ success: true, message: 'Paper trading reset successfully' });
  } catch (error) {
    console.error('Error resetting paper trading:', error);
    return json({ error: 'Failed to reset paper trading' }, { status: 500 });
  }
}
