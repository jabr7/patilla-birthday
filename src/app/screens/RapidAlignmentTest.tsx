import { useState } from 'react';
import { StageImage } from '../../components/StageImage';
import { useGame } from '../useGame';
import { pickText, type TextEntry } from '../../utils/textPicker';
import type { Screen } from '../types';
import feedbackTexts from '../../texts/alignment/feedback.json';
import resultTexts from '../../texts/alignment/results.json';

interface RapidAlignmentTestProps {
  onNavigate: (screen: Screen) => void;
}

const alignmentQuestions = [
  {
    question: 'Para Patilla, ¿cómo te alineás en geopolítica?',
    options: ['No alineado peronista', 'Realista duro', 'Mercosur enjoyer'],
  },
  {
    question: 'Para Patilla, ¿qué doctrina económica te describe mejor?',
    options: ['FMI trauma', 'ONU burócrata', 'Tercera posición'],
  },
  {
    question: 'Para Patilla, ¿qué postura de política exterior elegís?',
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

const alignmentLabels: Record<string, string> = {
  no_alineado_peronista: 'No alineado peronista',
  realista_duro: 'Realista duro',
  mercosur_enjoyer: 'Mercosur enjoyer',
  fmi_trauma: 'FMI trauma',
  onu_burocrata: 'ONU burócrata',
  tercera_posicion: 'Tercera posición',
  doctrina_estrada: 'Doctrina Estrada',
  constructivista: 'Constructivista',
  liberal: 'Liberal',
};

export function RapidAlignmentTest({ onNavigate }: RapidAlignmentTestProps) {
  const { state, dispatch } = useGame();
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [showOutcome, setShowOutcome] = useState(false);
  const [outcomeText, setOutcomeText] = useState('');
  const [pendingOption, setPendingOption] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    if (showOutcome) return;
    setPendingOption(option);
    const alignmentKey = alignmentMap[option] || 'unknown';
    const pool = feedbackTexts as TextEntry[];
    const text = pickText(pool, [alignmentKey]);
    setOutcomeText(text);
    setShowOutcome(true);
  };

  const handleContinue = () => {
    if (!pendingOption) return;
    const newSelected = [...selected, pendingOption];
    setSelected(newSelected);

    if (currentQ === alignmentQuestions.length - 1) {
      const finalAlignment =
        alignmentMap[pendingOption] || alignmentMap[newSelected[0]] || 'unknown';
      dispatch({ type: 'SET_ALIGNMENT', payload: finalAlignment });
      dispatch({ type: 'PUSH_FLAG', payload: `alignment_${finalAlignment}` });
    }

    setPendingOption(null);
    setShowOutcome(false);
    setOutcomeText('');
    setCurrentQ(currentQ + 1);
  };

  if (currentQ >= alignmentQuestions.length) {
    const pool = resultTexts as TextEntry[];
    const resultLine = state.alignment
      ? pickText(pool, [`alignment_${state.alignment}`])
      : pickText(pool, []);
    return (
      <div className="alignment-test">
        <StageImage corruption={state.corruption} historyFlags={state.historyFlags} />
        <div className="game-content">
          <button onClick={() => onNavigate('MainMenu')}>Volver al Menú</button>
          <h2>Test de Alineamiento Completo</h2>
          <p>
            Tu alineamiento:{' '}
            {state.alignment
              ? alignmentLabels[state.alignment] ?? state.alignment
              : 'unknown'}
          </p>
          <div className="verdict">{resultLine}</div>
        </div>
      </div>
    );
  }

  const question = alignmentQuestions[currentQ];

  return (
    <div className="alignment-test">
      <StageImage corruption={state.corruption} historyFlags={state.historyFlags} />
      <div className="game-content">
        <button onClick={() => onNavigate('MainMenu')}>Volver al Menú</button>
        <h2>Test Rápido de Alineamiento</h2>
        <p>
          Pregunta {currentQ + 1} de {alignmentQuestions.length}
        </p>
        <h3>{question.question}</h3>
        <div className="answers">
          {question.options.map((option) => (
            <button key={option} onClick={() => handleSelect(option)} disabled={showOutcome}>
              {option}
            </button>
          ))}
        </div>
      </div>
      {showOutcome && (
        <>
          <div className="outcome-backdrop" onClick={handleContinue}></div>
          <div className="outcome-modal">
            <div className="outcome">
              <p>{outcomeText}</p>
              <button onClick={handleContinue}>
                {currentQ === alignmentQuestions.length - 1 ? 'Ver resultado' : 'Siguiente'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
