import { useCallback, useEffect, useState } from 'react';
import { QuizCard } from '../types/quiz';
import { getTopicById } from '../data/topics';
import {
  getDueCards,
  getLockedTopicIds,
  getNewCardsSeenToday,
  getProgress,
  getReviewedTodayCount,
  unlockCards,
} from '../db/progressRepository';
import { getSettings } from '../db/settingsRepository';
import { generateChoices } from '../lib/distractorGenerator';
import { useDatabase } from './useDatabase';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function buildQuizCard(topicId: string): Promise<QuizCard | null> {
  const topic = getTopicById(topicId);
  if (!topic) return null;

  const { choices, correctIndex } = generateChoices(
    topic.category,
    topic.correctAnswer,
    topic.question,
  );

  const progress = await getProgress(topicId);
  const meta = progress
    ? {
        masteryLevel: progress.masteryLevel,
        lastReviewedAt: progress.lastReviewedAt,
        totalReviews: progress.totalReviews,
        totalCorrect: progress.totalCorrect,
      }
    : undefined;

  return { topic, choices, correctIndex, meta };
}

export function useScheduler() {
  const { isReady } = useDatabase();
  const [dueCount, setDueCount] = useState(0);
  const [newCardsRemaining, setNewCardsRemaining] = useState(0);
  const [studiedToday, setStudiedToday] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isReady) return;
    setLoading(true);
    try {
      const [due, settings, newSeen, locked, reviewed] = await Promise.all([
        getDueCards(), getSettings(), getNewCardsSeenToday(), getLockedTopicIds(), getReviewedTodayCount(),
      ]);
      const newRemaining = Math.max(0, settings.dailyNewLimit - newSeen);

      setDueCount(due.length);
      setNewCardsRemaining(Math.min(newRemaining, locked.length));
      setStudiedToday(reviewed);
    } catch (err) {
      console.error('Scheduler refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, [isReady]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const buildQuizDeck = useCallback(
    async (maxCards: number = 20): Promise<QuizCard[]> => {
      const now = new Date();
      const [due, settings, newSeen] = await Promise.all([
        getDueCards(now), getSettings(), getNewCardsSeenToday(now),
      ]);
      const newAllowance = Math.max(0, settings.dailyNewLimit - newSeen);

      const cards: QuizCard[] = [];

      for (const progress of due) {
        if (cards.length >= maxCards) break;
        const card = await buildQuizCard(progress.topicId);
        if (card) cards.push(card);
      }

      if (cards.length < maxCards && newAllowance > 0) {
        const locked = await getLockedTopicIds();
        const toUnlock = locked.slice(0, Math.min(newAllowance, maxCards - cards.length));
        if (toUnlock.length > 0) {
          await unlockCards(toUnlock);
          for (const topicId of toUnlock) {
            const card = await buildQuizCard(topicId);
            if (card) cards.push(card);
          }
        }
      }

      return shuffle(cards);
    },
    [],
  );

  return { dueCount, newCardsRemaining, studiedToday, loading, refresh, buildQuizDeck };
}
