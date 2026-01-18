import { useState, useEffect } from 'react';
import { StageImage } from '../../components/StageImage';
import { useGame } from '../GameProvider';
import { pickText, type TextEntry } from '../../utils/textPicker';
import type { Screen } from '../types';
import correctMild from '../../texts/quiz/correct_mild.json';
import correctHeroic from '../../texts/quiz/correct_heroic.json';
import wrongMild from '../../texts/quiz/wrong_mild.json';
import wrongCursed from '../../texts/quiz/wrong_cursed.json';

interface CoreGameProps {
  onNavigate: (screen: Screen) => void;
}

interface Question {
  id: string;
  question: string;
  answers: Array<{
    text: string;
    correct: boolean;
    flag?: string;
  }>;
}

const placeholderQuestions: Question[] = [
  {
    id: 'return_of_peron',
    question: '¿Cuándo volvió Perón a Argentina?',
    answers: [
      { text: '1973', correct: true },
      { text: '1972 (prólogo: ABITAB cutscene)', correct: false, flag: 'abitab' },
      { text: '1974 (post cirugía de rodilla: “ahí recién estaba listo”)', correct: false, flag: 'knee_surgery' },
    ],
  },
  {
    id: 'pando_mujica',
    question: 'Mujica y la Toma de Pando: ¿qué fue (en serio)?',
    answers: [
      { text: 'Una acción del MLN-Tupamaros en 1969 en la ciudad de Pando', correct: true },
      { text: 'Operación ABITAB: tomar la ventanilla y declarar soberanía', correct: false, flag: 'abitab' },
      { text: 'Toma de Pando: cuando Patilla “toma” la tesis y el grupo desaparece', correct: false, flag: 'tesis_ghost_member' },
    ],
  },
  {
    id: 'hard_power_abuela_cuetes',
    question: 'En RI, ¿qué es “hard power”?',
    answers: [
      { text: 'Capacidad coercitiva (militar/económica)', correct: true },
      { text: 'Que tu abuela se gaste 10 palos en cuetes (coerción luminosa)', correct: false, flag: 'abuela_cuetes' },
      { text: 'Ir de furry diplomático: “uwu pero con sanciones”', correct: false, flag: 'furry_diplomacy' },
    ],
  },
  {
    id: 'boca_reaction',
    question: 'Cuando pierde Boca, ¿cuál es la reacción “institucional” del padre bostero?',
    answers: [
      { text: 'Declara duelo nacional y suspende el asado', correct: true },
      { text: 'Convoca al Consejo de Seguridad del living y veta el control remoto', correct: false, flag: 'boca_duelo' },
      { text: 'Redacta un comunicado furry: “no fue derrota, fue transición de fase (uwu)”', correct: false, flag: 'furry_diplomacy' },
    ],
  },
  {
    id: 'macro_crisis_meme',
    question: 'En política internacional, ¿cómo se llama cuando todo se desordena pero “se gestiona” igual?',
    answers: [
      { text: 'Crisis', correct: true },
      { text: 'Normalidad latinoamericana (modo supervivencia)', correct: false, flag: 'latam_mode' },
      { text: 'ABITAB macroeconómico: vas, pagás, rezás y salís (a veces)', correct: false, flag: 'abitab' },
    ],
  },
  {
    id: 'andes_diplomacy',
    question: 'Diplomacia andina: ¿cuál es la explicación “técnica” más probable de un retraso?',
    answers: [
      { text: 'Problemas logísticos / coordinación', correct: true },
      { text: 'Altitud + burocracia: el trámite sube, pero el sello no', correct: false, flag: 'andes_protocol' },
      { text: 'El canciller quedó trabado en la cutscene de cuetes de la abuela', correct: false, flag: 'abuela_cuetes' },
    ],
  },
  {
    id: 'pinguino_incident',
    question: 'En política argentina, ¿cómo se llama cuando “pasa lo del pingüino” y nadie hace preguntas?',
    answers: [
      { text: 'Crisis de comunicación', correct: true },
      { text: 'Incidente del pingüino (clasificado: “mejor no saber”)', correct: false, flag: 'pinguino_incident' },
      { text: 'Soft power fallido: el pingüino no quiso cooperar (uwu)', correct: false, flag: 'furry_diplomacy' },
    ],
  },
  {
    id: 'cadena_nacional_cf',
    question: 'En modo anti-K, ¿qué es una “cadena nacional”?',
    answers: [
      { text: 'Un mensaje oficial transmitido por radio/TV', correct: true },
      { text: 'Un “stream” obligatorio donde el botón de saltar está proscripto', correct: false, flag: 'cadena_nacional' },
      { text: 'Un patch notes del “relato” con compatibilidad retroactiva', correct: false, flag: 'relato_k' },
    ],
  },
  {
    id: 'thesis_group_problem',
    question: 'Para Patilla, la tesis de RI: ¿cuál es el principal “actor desestabilizador” del proceso?',
    answers: [
      { text: 'El grupo que no coordina y deja todo para el final', correct: true },
      { text: 'La doctrina “yo hago la intro” (y desaparece 3 semanas)', correct: false, flag: 'tesis_ghost_member' },
      { text: 'El equilibrio de poder en Google Docs: todos editan, nadie escribe', correct: false, flag: 'tesis_docs_war' },
    ],
  },
  {
    id: 'ceico_unpaid',
    question: 'CEICO: ¿cuál es la doctrina económica oficial del cargo?',
    answers: [
      { text: 'Trabajo no remunerado (vocación + mates)', correct: true },
      { text: 'Plan Platita: te pagan en “experiencia” con inflación', correct: false, flag: 'ceico_experience_pay' },
      { text: 'FMI personal: ajustás tu dignidad y seguís', correct: false, flag: 'ceico_fmi_personal' },
    ],
  },
  {
    id: 'ceico_boss_ship',
    question: 'CEICO: tu jefe te “empareja” con una compañera para un proyecto. ¿Qué es eso en RI?',
    answers: [
      { text: 'Diplomacia informal (canales paralelos)', correct: true },
      { text: 'Un intento de alianza estratégica con cero consulta previa', correct: false, flag: 'ceico_boss_ship' },
      { text: 'Constructivismo laboral: si lo nombrás “Pachamama”, existe', correct: false, flag: 'ceico_pachamama_lore' },
    ],
  },
  {
    id: 'ort_what',
    question: 'ORT: ¿qué es realmente?',
    answers: [
      { text: 'Una institución educativa', correct: true },
      { text: 'Un spawn point de nerds diplomáticos (RI edition)', correct: false, flag: 'ort_lore' },
      { text: 'Una ONU chiquita: mucho comité, poco presupuesto', correct: false, flag: 'ort_model_un' },
    ],
  },
  {
    id: 'shabbat_definition',
    question: '¿Qué es Shabat?',
    answers: [
      { text: 'Día de descanso semanal en el judaísmo', correct: true },
      { text: 'Un patch de balance: “hoy no se farmea, hoy se descansa”', correct: false, flag: 'shabbat_patch' },
      { text: 'Un cese al fuego doméstico (hasta nuevo aviso)', correct: false, flag: 'shabbat_ceasefire' },
    ],
  },
  {
    id: 'micky_vainilla',
    question: 'Capusotto: ¿quién es Micky Vainilla (en esencia)?',
    answers: [
      { text: 'Una parodia de pop star careta y su discurso “correcto”', correct: true },
      { text: 'Un canciller del marketing: sonríe, posa y evita preguntas', correct: false, flag: 'micky_vainilla_marketing' },
      { text: 'El embajador furry del soft power: “uwu, pero con jingle”', correct: false, flag: 'furry_diplomacy' },
    ],
  },
  {
    id: 'october_17',
    question: '¿Qué fue el 17 de octubre?',
    answers: [
      { text: 'Día de la Lealtad', correct: true },
      { text: 'Día del Descargo del Luky sobre la policia (feriado móvil)', correct: false, flag: 'luky_police_yell' },
      { text: 'Día Nacional de Arrancar en Quinta', correct: false, flag: 'start_in_5th_boni' },
    ],
  },
  {
    id: 'third_position',
    question: '¿Qué era la Tercera Posición?',
    answers: [
      { text: 'Ni Washington ni Moscú', correct: true },
      { text: 'Ni Civ 4 ni tocar pasto (equilibrio espiritual)', correct: false, flag: 'civ4_fan' },
      { text: 'Ni Estado ni Mercado: ABITAB (la verdadera soberanía)', correct: false, flag: 'abitab_base' },
    ],
  },
  {
    id: 'patilla_summit',
    question: 'Patilla en una cumbre internacional: ¿qué hace primero?',
    answers: [
      { text: 'Saluda y sigue el protocolo (speedrun diplomático)', correct: true },
      { text: 'Pide un micrófono para hablar de Civilization 4', correct: false, flag: 'civ4_fan' },
      { text: 'Arranca en quinta y declara “todo bajo control”', correct: false, flag: 'start_in_5th_boni' },
    ],
  },
  {
    id: 'abitab_what',
    question: 'Para Patilla, ABITAB: ¿qué es realmente?',
    answers: [
      { text: 'Su base (spawn point)', correct: true },
      { text: 'El Ministerio de Economía pero con facturas', correct: false, flag: 'abitab' },
      { text: 'Un portal interdimensional con horario comercial', correct: false, flag: 'abitab' },
    ],
  },
  {
    id: 'jazmin_who',
    question: 'Jazmín: ¿quién es?',
    answers: [
      { text: 'La perra Nazi', correct: true },
      { text: 'Embajadora plenipotenciaria del Reich Canino', correct: false, flag: 'jazmin_dog' },
      { text: 'Agente encubierta K9 (operación “olfato”)', correct: false, flag: 'jazmin_dog' },
    ],
  },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function selectRandomQuestions(questions: Question[], count: number): Question[] {
  const shuffled = shuffleArray(questions);
  return shuffled.slice(0, count);
}

export function CoreGame({ onNavigate }: CoreGameProps) {
  const { state, dispatch } = useGame();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [outcomeText, setOutcomeText] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (selectedQuestions.length === 0) {
      const randomQuestions = selectRandomQuestions(placeholderQuestions, state.maxQuestions);
      setSelectedQuestions(randomQuestions);
    }
  }, [state.maxQuestions]);

  const currentQ = selectedQuestions[state.currentQuestion];
  const isComplete = state.currentQuestion >= state.maxQuestions || !currentQ;

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        onNavigate('FinalJudgment');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onNavigate]);

  if (isComplete) {
    return (
      <div className="core-game">
        <div className="game-content">
          <h2>Evaluación Completa</h2>
          <p>Procediendo al Juicio Final...</p>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="core-game">
        <div className="game-content">
          <h2>Cargando preguntas...</h2>
        </div>
      </div>
    );
  }

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    const answer = currentQ.answers[index];
    setSelectedAnswer(index);

    // Calcular la nueva corrupción ANTES de dispatch
    const newCorruption = answer.correct
      ? state.corruption
      : Math.min(state.corruption + 1, 5);
    
    // Calcular los nuevos flags ANTES de dispatch
    const newFlags = answer.flag
      ? [...state.historyFlags, answer.flag]
      : state.historyFlags;

    // Actualizar el estado
    dispatch({
      type: 'ANSWER_QUESTION',
      payload: {
        correct: answer.correct,
        flag: answer.flag,
      },
    });

    // Seleccionar bucket usando la NUEVA corrupción
    const bucket = answer.correct
      ? newCorruption < 2
        ? 'correct_mild'
        : 'correct_heroic'
      : newCorruption < 3
        ? 'wrong_mild'
        : 'wrong_cursed';

    let textPool: TextEntry[];
    switch (bucket) {
      case 'correct_mild':
        textPool = correctMild as TextEntry[];
        break;
      case 'correct_heroic':
        textPool = correctHeroic as TextEntry[];
        break;
      case 'wrong_mild':
        textPool = wrongMild as TextEntry[];
        break;
      case 'wrong_cursed':
        textPool = wrongCursed as TextEntry[];
        break;
      default:
        textPool = ['Processing...'] satisfies TextEntry[];
    }

    // Usar los NUEVOS flags para seleccionar texto
    const selectedText = pickText(textPool, newFlags);
    setOutcomeText(selectedText);
    setShowOutcome(true);
  };

  const handleContinue = () => {
    dispatch({ type: 'NEXT_QUESTION' });
    setSelectedAnswer(null);
    setShowOutcome(false);
    setOutcomeText('');
  };

  return (
    <div className="core-game">
      <div className="game-content">
        <div className="question-header">
          <p>
            Pregunta {state.currentQuestion + 1} de {state.maxQuestions}
          </p>
        </div>
        <h2>{currentQ.question}</h2>
        <div className="answers">
          {currentQ.answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={
                selectedAnswer === index
                  ? answer.correct
                    ? 'correct'
                    : 'wrong'
                  : ''
              }
            >
              {answer.text}
            </button>
          ))}
        </div>
        {showOutcome && (
          <>
            <div className="outcome-backdrop" onClick={handleContinue}></div>
            <div className="outcome-modal">
              <div className="outcome">
                <StageImage 
                  corruption={state.corruption} 
                  historyFlags={state.historyFlags}
                  className="outcome-image"
                />
                <p>{outcomeText}</p>
                <button onClick={handleContinue}>Continuar</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
