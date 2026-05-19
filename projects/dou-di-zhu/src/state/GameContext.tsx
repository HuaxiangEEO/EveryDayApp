import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import { createInitialState, gameReducer, type Action } from './gameReducer';
import type { GameState } from '../types';

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<Action>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
