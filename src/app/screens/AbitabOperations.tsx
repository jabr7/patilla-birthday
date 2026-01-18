import { useState } from 'react';
import { StageImage } from '../../components/StageImage';
import { useGame } from '../GameProvider';
import type { Screen } from '../types';

interface AbitabOperationsProps {
  onNavigate: (screen: Screen) => void;
}

export function AbitabOperations({ onNavigate }: AbitabOperationsProps) {
  const { state, dispatch } = useGame();
  const isAuthorized = state.historyFlags.includes('abitab_base');
  const [showModeInfo, setShowModeInfo] = useState(() => !isAuthorized);

  const handleAuthorize = () => {
    dispatch({ type: 'PUSH_FLAG', payload: 'abitab_base' });
    setShowModeInfo(false);
  };

  const handleDeactivate = () => {
    dispatch({ type: 'REMOVE_FLAG', payload: 'abitab_base' });
    setShowModeInfo(true);
  };

  return (
    <div className="abitab-operations">
      <StageImage corruption={state.corruption} historyFlags={state.historyFlags} />
      <div className="game-content">
        <button onClick={() => onNavigate('MainMenu')}>Volver al Menú</button>
        <h2>Operaciones ABITAB</h2>
        {!isAuthorized ? (
          <>
            <p>¿Autorizar operaciones de la base ABITAB?</p>
            <button onClick={handleAuthorize}>Autorizar ABITAB</button>
          </>
        ) : (
          <>
            <p>Modo ABITAB: ACTIVADO. El fondo y los textos ahora están intervenidos.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => onNavigate('CoreGame')}>Ir al Core</button>
              <button onClick={handleDeactivate}>Desactivar ABITAB</button>
            </div>
          </>
        )}
      </div>
      {showModeInfo && (
        <>
          <div
            className="outcome-backdrop"
            onClick={() => setShowModeInfo(false)}
          ></div>
          <div className="outcome-modal">
            <div className="outcome">
              <h3>Modo ABITAB</h3>
              <p>
                Esto es un modo de juego “lore”: si autorizás ABITAB, se activa
                la temática ABITAB en el resto del juego.
              </p>
              <p>
                No cambia tu corrupción ni suma puntos; solo agrega un flag para
                que los textos y el Juicio Final reaccionen.
              </p>
              <button onClick={() => setShowModeInfo(false)}>Entendido</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
