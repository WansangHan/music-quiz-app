# music-quiz-app

화성학(Harmony) 학습 앱 - 간격반복(SM-2) 기반 객관식 퀴즈

## 기술 스택
- React Native + Expo + TypeScript
- React Navigation (Bottom Tab + Stack)
- expo-sqlite (네이티브) / MemoryDatabase (웹)
- SM-2 간격반복 알고리즘

## 명령어
- `npm start` — Expo 개발 서버
- `npm run web` — 웹 브라우저 실행
- `npm test` — Jest 단위 테스트
- `npx tsc --noEmit` — 타입 체크

## 프로젝트 구조
- `src/lib/` — 순수 함수 (musicTheory, sm2, dateUtils, distractorGenerator)
- `src/data/topics.ts` — 정적 토픽 배열 (~450개, 6종 카테고리)
- `src/db/` — SQLite 추상화 (client, memoryDb, repositories)
- `src/hooks/` — useQuizEngine(객관식), useScheduler(덱 빌더), useSettings, useDatabase
- `src/screens/` — 6개 화면
- `src/components/` — common/, home/, quiz/
- `src/constants/` — 디자인 토큰, 퀴즈 상수, 라우트
- `src/types/` — TypeScript 인터페이스

## 퀴즈 6종
1. 음정 (Interval) — 두 음 사이의 음정 식별
2. 코드 (Chord) — 구성음으로 코드 이름 맞추기
3. 스케일 (Scale) — 구성음으로 스케일 이름 맞추기
4. 코드 구성음 (Chord Tone) — 코드의 특정 음 맞추기
5. 스케일 구성음 (Scale Tone) — 스케일의 특정 음 맞추기
6. 음이름 (Note Name) — 계이름↔음이름, 이명동음

## 주의사항
- 한국어 UI, 하드코딩 (i18n 프레임워크 없음)
- 옥타브 무관 12음 피치 클래스만 사용
- muscle-quiz-app과 동일한 아키텍처 패턴
