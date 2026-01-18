import { StageImage } from '../../components/StageImage';
import { useGame } from '../useGame';
import { hasPlayedAnyGame } from '../selectors';
import type { Screen } from '../types';

interface MainMenuProps {
  onNavigate: (screen: Screen) => void;
  musicEnabled: boolean;
  onToggleMusic: () => void;
}

export function MainMenu({ onNavigate, musicEnabled, onToggleMusic }: MainMenuProps) {
  const { state } = useGame();
  const canAccessFinalJudgment = hasPlayedAnyGame(state);

  return (
    <div className="main-menu">
      <StageImage corruption={state.corruption} historyFlags={state.historyFlags} />
      <div className="menu-content">
        <h1>Experiencia Interactiva Peronista</h1>
        <p className="tagline">La historia la escriben los que responden bien.</p>
        <div className="menu-buttons">
          <button onClick={onToggleMusic}>
            Aprete aqui para sentir el peronismo ({musicEnabled ? 'ON' : 'OFF'})
          </button>
          <button onClick={() => onNavigate('CoreGame')}>
            Comenzar Evaluación Histórica
          </button>
          <button onClick={() => onNavigate('RapidAlignmentTest')}>
            Test Rápido de Alineamiento
          </button>
          <button onClick={() => onNavigate('AbitabOperations')}>
            Operaciones ABITAB
          </button>
          <button
            onClick={() => onNavigate('FinalJudgment')}
            disabled={!canAccessFinalJudgment}
          >
            Juicio de Cristina
          </button>
        </div>
      </div>
    </div>
  );
}
