import { Context } from 'hono';
import type { Env } from '../lib/types';
import { getSessionWithExpiry } from '../lib/db';

export async function sessionStatusHandler(c: Context<{ Bindings: Env }>) {
  const id = c.req.param('id') ?? '';
  const session = await getSessionWithExpiry(c.env, id);
  if (!session) return c.json({ status: 'not_found' }, 404);
  return c.json({ status: session.status });
}
