import { useReducer, type ReactNode } from 'react';
import { gameReducer, initialState } from './reducer';
import { GameContext } from './GameContext';

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}
