import type { GameState, GameAction } from './types';

export const initialState: GameState = {
  corruption: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
  currentQuestion: 0,
  maxQuestions: 10,
  historyFlags: [],
  alignment: null,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ANSWER_QUESTION': {
      const { correct, flag } = action.payload;
      const newCorruption = correct
        ? state.corruption
        : Math.min(state.corruption + 1, 5);
      
      // Evitar duplicados: solo agregar flag si no existe ya
      const newFlags = flag && !state.historyFlags.includes(flag)
        ? [...state.historyFlags, flag]
        : state.historyFlags;

      return {
        ...state,
        corruption: newCorruption,
        correctAnswers: correct
          ? state.correctAnswers + 1
          : state.correctAnswers,
        wrongAnswers: correct ? state.wrongAnswers : state.wrongAnswers + 1,
        historyFlags: newFlags,
      };
    }
    case 'SET_ALIGNMENT':
      return {
        ...state,
        alignment: action.payload,
      };
    case 'PUSH_FLAG':
      // Evitar duplicados al agregar flags manualmente
      const flagExists = state.historyFlags.includes(action.payload);
      return {
        ...state,
        historyFlags: flagExists
          ? state.historyFlags
          : [...state.historyFlags, action.payload],
      };
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestion: state.currentQuestion + 1,
      };
    case 'RESET_SESSION':
      return initialState;
    default:
      return state;
  }
}
