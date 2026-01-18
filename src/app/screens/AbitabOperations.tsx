import { useState } from 'react';
import { StageImage } from '../../components/StageImage';
import { useGame } from '../GameProvider';
import type { Screen } from '../types';

interface AbitabOperationsProps {
  onNavigate: (screen: Screen) => void;
}

export function AbitabOperations({ onNavigate }: AbitabOperationsProps) {
  const { state, dispatch } = useGame();
  const [authorized, setAuthorized] = useState(false);

  const handleAuthorize = () => {
    dispatch({ type: 'PUSH_FLAG', payload: 'abitab_base' });
    setAuthorized(true);
  };

  return (
    <div className="abitab-operations">
      <StageImage corruption={state.corruption} historyFlags={state.historyFlags} />
      <div className="game-content">
        <h2>Operaciones ABITAB</h2>
        {!authorized ? (
          <>
            <p>¿Autorizar operaciones de la base ABITAB?</p>
            <button onClick={handleAuthorize}>Autorizar ABITAB</button>
          </>
        ) : (
          <>
            <p>Base ABITAB autorizada. Operaciones iniciadas.</p>
            <button onClick={() => onNavigate('MainMenu')}>
              Volver al Menú
            </button>
          </>
        )}
      </div>
    </div>
  );
}
