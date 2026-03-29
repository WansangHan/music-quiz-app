import { useCallback, useEffect, useRef, useState } from 'react';
import { QuizCard, AnswerResult, QuizSessionSummary } from '../types/quiz';
import { QuizState } from '../constants/quizState';
import { MasteryLevel } from '../types/progress';
import { calculateNextReview } from '../lib/sm2';
import { toISOString } from '../lib/dateUtils';
import { getProgress, upsertProgress } from '../db/progressRepository';
import { createSession, finishSession, saveAnswer } from '../db/sessionRepository';
import { incrementDailyStats } from '../db/streakRepository';
import { WRONG_ANSWER_DISPLAY_MS, CORRECT_ANSWER_DISPLAY_MS, PROMOTION_THRESHOLDS } from '../constants/quiz';

interface QuizEngineState {
  state: QuizState;
  currentIndex: number;
  cards: QuizCard[];
  results: AnswerResult[];
  selectedIndex: number | null;
}

export function useQuizEngine(initialCards: QuizCard[]) {
  const [engine, setEngine] = useState<QuizEngineState>({
    state: initialCards.length > 0 ? QuizState.ShowingCard : QuizState.Complete,
    currentIndex: 0,
    cards: initialCards,
    results: [],
    selectedIndex: null,
  });

  const sessionIdRef = useRef<number | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sessionIdRef.current === null && initialCards.length > 0) {
      createSession().then((id) => {
        sessionIdRef.current = id;
      });
    }
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, [initialCards]);

  const currentCard = engine.cards[engine.currentIndex] ?? null;

  const advanceToNext = useCallback(() => {
    setEngine((prev) => {
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= prev.cards.length) {
        if (sessionIdRef.current) {
          const correct = prev.results.filter((r) => r.isCorrect).length;
          const wrong = prev.results.length - correct;
          finishSession(sessionIdRef.current, prev.cards.length, correct, wrong);
        }
        return { ...prev, state: QuizState.Complete, currentIndex: nextIndex, selectedIndex: null };
      }
      return {
        ...prev,
        state: QuizState.ShowingCard,
        currentIndex: nextIndex,
        selectedIndex: null,
      };
    });
  }, []);

  const submitAnswer = useCallback(
    async (choiceIndex: number) => {
      if (engine.state !== QuizState.ShowingCard || !currentCard) return;

      setEngine((prev) => ({ ...prev, state: QuizState.Checking, selectedIndex: choiceIndex }));

      const isCorrect = choiceIndex === currentCard.correctIndex;
      const userAnswer = currentCard.choices[choiceIndex];
      const correctAnswer = currentCard.choices[currentCard.correctIndex];

      if (sessionIdRef.current) {
        await saveAnswer({
          sessionId: sessionIdRef.current,
          topicId: currentCard.topic.id,
          userAnswer,
          correctAnswer,
          isCorrect,
        });
      }

      const progress = await getProgress(currentCard.topic.id);
      const sm2Result = calculateNextReview({
        isCorrect,
        currentLevel: progress?.masteryLevel ?? 0,
        currentStreak: progress?.streak ?? 0,
        currentInterval: progress?.intervalDays ?? 0,
      });

      await Promise.all([
        upsertProgress({
          topicId: currentCard.topic.id,
          masteryLevel: sm2Result.nextLevel,
          streak: sm2Result.nextStreak,
          intervalDays: sm2Result.nextInterval,
          nextReviewAt: toISOString(sm2Result.nextReviewAt),
          isCorrect,
        }),
        incrementDailyStats(new Date(), isCorrect, progress?.totalReviews === 0),
      ]);

      const previousLevel = progress?.masteryLevel ?? MasteryLevel.New;
      const newLevel = sm2Result.nextLevel;
      const currentThresholdIndex = Math.min(previousLevel, 3);

      const answerResult: AnswerResult = {
        topicId: currentCard.topic.id,
        userAnswer,
        correctAnswer,
        isCorrect,
        previousLevel,
        newLevel,
        newStreak: sm2Result.nextStreak,
        promotionThreshold: PROMOTION_THRESHOLDS[currentThresholdIndex],
        didLevelUp: newLevel > previousLevel,
      };

      setEngine((prev) => ({
        ...prev,
        state: isCorrect ? QuizState.CorrectFeedback : QuizState.WrongFeedback,
        results: [...prev.results, answerResult],
        selectedIndex: choiceIndex,
      }));

      feedbackTimerRef.current = setTimeout(
        () => advanceToNext(),
        isCorrect ? CORRECT_ANSWER_DISPLAY_MS : WRONG_ANSWER_DISPLAY_MS,
      );
    },
    [engine.state, currentCard, advanceToNext],
  );

  const nextCard = useCallback(() => {
    if (engine.state === QuizState.CorrectFeedback || engine.state === QuizState.WrongFeedback) {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      advanceToNext();
    }
  }, [engine.state, advanceToNext]);

  const getSummary = useCallback((): QuizSessionSummary => {
    const correctCount = engine.results.filter((r) => r.isCorrect).length;
    const topicMap = new Map(engine.cards.map((c) => [c.topic.id, c.topic]));
    const masteryChanges = engine.results
      .filter((r) => r.didLevelUp)
      .map((r) => ({
        topicName: topicMap.get(r.topicId)?.displayName ?? r.topicId,
        oldLevel: r.previousLevel,
        newLevel: r.newLevel,
      }));
    return {
      totalCards: engine.results.length,
      correctCount,
      wrongCount: engine.results.length - correctCount,
      accuracy: engine.results.length > 0 ? correctCount / engine.results.length : 0,
      levelUps: masteryChanges.length,
      masteryChanges,
    };
  }, [engine.results, engine.cards]);

  return {
    state: engine.state,
    currentIndex: engine.currentIndex,
    currentCard,
    selectedIndex: engine.selectedIndex,
    totalCards: engine.cards.length,
    results: engine.results,
    submitAnswer,
    nextCard,
    getSummary,
  };
}
