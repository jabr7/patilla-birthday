export type Screen =
  | 'MainMenu'
  | 'CoreGame'
  | 'RapidAlignmentTest'
  | 'AbitabOperations'
  | 'FinalJudgment';

export interface GameState {
  corruption: number;
  correctAnswers: number;
  wrongAnswers: number;
  currentQuestion: number;
  maxQuestions: number;
  historyFlags: string[];
  alignment: string | null;
}

export type GameAction =
  | { type: 'ANSWER_QUESTION'; payload: { correct: boolean; flag?: string } }
  | { type: 'SET_ALIGNMENT'; payload: string }
  | { type: 'PUSH_FLAG'; payload: string }
  | { type: 'REMOVE_FLAG'; payload: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESET_SESSION' };
