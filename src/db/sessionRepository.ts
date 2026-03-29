import { getDb } from './client';
import { toISOString } from '../lib/dateUtils';

export async function createSession(): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO quiz_sessions (started_at) VALUES (?)',
    toISOString(new Date()),
  );
  return result.lastInsertRowId;
}

export async function finishSession(
  sessionId: number,
  totalCards: number,
  correctCount: number,
  wrongCount: number,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE quiz_sessions SET
       finished_at = ?, total_cards = ?, correct_count = ?, wrong_count = ?
     WHERE id = ?`,
    toISOString(new Date()),
    totalCards,
    correctCount,
    wrongCount,
    sessionId,
  );
}

export async function saveAnswer(params: {
  sessionId: number;
  topicId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO session_answers
       (session_id, topic_id, user_answer, correct_answer, is_correct)
     VALUES (?, ?, ?, ?, ?)`,
    params.sessionId,
    params.topicId,
    params.userAnswer,
    params.correctAnswer,
    params.isCorrect ? 1 : 0,
  );
}
