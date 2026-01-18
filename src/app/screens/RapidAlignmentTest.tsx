import { useState } from 'react';
import { StageImage } from '../../components/StageImage';
import { useGame } from '../GameProvider';
import type { Screen } from '../types';

interface RapidAlignmentTestProps {
  onNavigate: (screen: Screen) => void;
}

const alignmentQuestions = [
  {
    question: 'Geopolitical alignment?',
    options: ['No alineado peronista', 'Realista duro', 'Mercosur enjoyer'],
  },
  {
    question: 'Economic doctrine?',
    options: ['FMI trauma', 'ONU burócrata', 'Tercera posición'],
  },
  {
    question: 'Foreign policy stance?',
    options: ['Doctrina Estrada', 'Constructivista', 'Liberal'],
  },
];

const alignmentMap: Record<string, string> = {
  'No alineado peronista': 'no_alineado_peronista',
  'Realista duro': 'realista_duro',
  'Mercosur enjoyer': 'mercosur_enjoyer',
  'FMI trauma': 'fmi_trauma',
  'ONU burócrata': 'onu_burocrata',
  'Tercera posición': 'tercera_posicion',
  'Doctrina Estrada': 'doctrina_estrada',
  Constructivista: 'constructivista',
  Liberal: 'liberal',
};

export function RapidAlignmentTest({ onNavigate }: RapidAlignmentTestProps) {
  const { state, dispatch } = useGame();
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (option: string) => {
    const newSelected = [...selected, option];
    setSelected(newSelected);
    setCurrentQ(currentQ + 1);

    if (currentQ === alignmentQuestions.length - 1) {
      const finalAlignment =
        alignmentMap[option] || alignmentMap[newSelected[0]] || 'unknown';
      dispatch({ type: 'SET_ALIGNMENT', payload: finalAlignment });
      dispatch({ type: 'PUSH_FLAG', payload: `alignment_${finalAlignment}` });
      setTimeout(() => {
        onNavigate('MainMenu');
      }, 1500);
    }
  };

  if (currentQ >= alignmentQuestions.length) {
    return (
      <div className="alignment-test">
        <StageImage corruption={state.corruption} historyFlags={state.historyFlags} />
        <div className="game-content">
          <h2>Test de Alineamiento Completo</h2>
          <p>Tu alineamiento: {state.alignment}</p>
          <button onClick={() => onNavigate('MainMenu')}>Volver al Menú</button>
        </div>
      </div>
    );
  }

  const question = alignmentQuestions[currentQ];

  return (
    <div className="alignment-test">
      <StageImage corruption={state.corruption} historyFlags={state.historyFlags} />
      <div className="game-content">
        <h2>Test Rápido de Alineamiento</h2>
        <p>
          Pregunta {currentQ + 1} de {alignmentQuestions.length}
        </p>
        <h3>{question.question}</h3>
        <div className="answers">
          {question.options.map((option) => (
            <button key={option} onClick={() => handleSelect(option)}>
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
