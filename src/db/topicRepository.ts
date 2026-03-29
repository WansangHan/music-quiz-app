import { getDb } from './client';

export async function getTopicCount(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM topics'
  );
  return row?.cnt ?? 0;
}
