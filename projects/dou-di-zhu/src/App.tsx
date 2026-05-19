import { useEffect } from 'react';
import { GameProvider, useGame } from './state/GameContext';
import { SettingsProvider } from './state/SettingsContext';
import { Table } from './components/Table';

function GameRoot() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (state.phase === 'dealing' && state.hands[0].length === 0) {
      dispatch({ type: 'START_GAME' });
    }
  }, [state.phase, state.hands, dispatch]);

  return <Table />;
}

export default function App() {
  return (
    <SettingsProvider>
      <GameProvider>
        <GameRoot />
      </GameProvider>
    </SettingsProvider>
  );
}
