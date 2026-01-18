import type { GameState } from './types';

export function getImageStage(corruption: number): 0 | 1 | 2 | 3 | 4 {
  if (corruption === 0) return 0;
  if (corruption === 1) return 1;
  if (corruption === 2) return 2;
  if (corruption === 3) return 3;
  return 4;
}

export function hasPlayedAnyGame(state: GameState): boolean {
  return (
    state.correctAnswers > 0 ||
    state.wrongAnswers > 0 ||
    state.alignment !== null ||
    state.historyFlags.length > 0
  );
}
