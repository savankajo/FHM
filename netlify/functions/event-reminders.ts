import type { Config } from '@netlify/functions';
import { sendUpcomingEventReminders } from '../../src/lib/notifications';

export default async () => {
  try {
    const result = await sendUpcomingEventReminders();
    console.log(`Event reminder run complete: ${result.events} event(s), ${result.recipients} recipient(s).`);
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Event reminder run failed:', error);
    return new Response(JSON.stringify({ error: 'Event reminder run failed' }), { status: 500 });
  }
};

export const config: Config = {
  schedule: '*/5 * * * *',
};
