import { useState } from 'react';
import { StageImage } from '../../components/StageImage';
import { useGame } from '../useGame';
import { pickText, getDominantTheme, type TextEntry } from '../../utils/textPicker';
import type { Screen } from '../types';
import correctMild from '../../texts/quiz/correct_mild.json';
import correctHeroic from '../../texts/quiz/correct_heroic.json';
import wrongMild from '../../texts/quiz/wrong_mild.json';
import wrongCursed from '../../texts/quiz/wrong_cursed.json';
import coreDebrief from '../../texts/core/debrief.json';

interface CoreGameProps {
  onNavigate: (screen: Screen) => void;
}

interface Question {
  id: string;
  question: string;
  tags?: string[];
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
    tags: ['historia'],
    answers: [
      { text: '1973', correct: true, flag: 'return_of_peron' },
      { text: '1972 (prólogo: ABITAB cutscene)', correct: false, flag: 'abitab' },
      { text: '1974 (post cirugía de rodilla: “ahí recién estaba listo”)', correct: false, flag: 'knee_surgery' },
    ],
  },
  {
    id: 'pando_mujica',
    question: 'Mujica y la Toma de Pando: ¿qué fue (en serio)?',
    answers: [
      {
        text: 'Una acción del MLN-Tupamaros en 1969 en la ciudad de Pando',
        correct: true,
        flag: 'pando_mujica',
      },
      { text: 'Operación ABITAB: tomar la ventanilla y declarar soberanía', correct: false, flag: 'abitab' },
      { text: 'Toma de Pando: cuando Patilla “toma” la tesis y el grupo desaparece', correct: false, flag: 'tesis_ghost_member' },
    ],
  },
  {
    id: 'hard_power_abuela_cuetes',
    question: 'En RI, ¿qué es “hard power”?',
    tags: ['ri'],
    answers: [
      { text: 'Capacidad coercitiva (militar/económica)', correct: true, flag: 'hard_power_abuela_cuetes' },
      { text: 'Que tu abuela se gaste 10 palos en cuetes (coerción luminosa)', correct: false, flag: 'abuela_cuetes' },
      { text: 'Ir de furry diplomático: “uwu pero con sanciones”', correct: false, flag: 'furry_diplomacy' },
    ],
  },
  {
    id: 'boca_reaction',
    question: 'Cuando pierde Boca, ¿cuál es la reacción “institucional” del padre bostero?',
    answers: [
      { text: 'Declara duelo nacional y suspende el asado', correct: true, flag: 'boca_reaction' },
      { text: 'Convoca al Consejo de Seguridad del living y veta el control remoto', correct: false, flag: 'boca_duelo' },
      { text: 'Redacta un comunicado furry: “no fue derrota, fue transición de fase (uwu)”', correct: false, flag: 'furry_diplomacy' },
    ],
  },
  {
    id: 'macro_crisis_meme',
    question: 'En política internacional, ¿cómo se llama cuando todo se desordena pero “se gestiona” igual?',
    tags: ['ri'],
    answers: [
      { text: 'Crisis', correct: true, flag: 'macro_crisis_meme' },
      { text: 'Normalidad latinoamericana (modo supervivencia)', correct: false, flag: 'latam_mode' },
      { text: 'ABITAB macroeconómico: vas, pagás, rezás y salís (a veces)', correct: false, flag: 'abitab' },
    ],
  },
  {
    id: 'andes_diplomacy',
    question: 'Diplomacia andina: ¿cuál es la explicación “técnica” más probable de un retraso?',
    answers: [
      { text: 'Problemas logísticos / coordinación', correct: true, flag: 'andes_diplomacy' },
      { text: 'Altitud + burocracia: el trámite sube, pero el sello no', correct: false, flag: 'andes_protocol' },
      { text: 'El canciller quedó trabado en la cutscene de cuetes de la abuela', correct: false, flag: 'abuela_cuetes' },
    ],
  },
  {
    id: 'pinguino_incident',
    question: 'En política argentina, ¿cómo se llama cuando “pasa lo del pingüino” y nadie hace preguntas?',
    answers: [
      { text: 'Crisis de comunicación', correct: true, flag: 'pinguino_incident' },
      { text: 'Incidente del pingüino (clasificado: “mejor no saber”)', correct: false, flag: 'pinguino_incident' },
      { text: 'Soft power fallido: el pingüino no quiso cooperar (uwu)', correct: false, flag: 'furry_diplomacy' },
    ],
  },
  {
    id: 'cadena_nacional_cf',
    question: 'En modo anti-K, ¿qué es una “cadena nacional”?',
    tags: ['relato_k'],
    answers: [
      { text: 'Un mensaje oficial transmitido por radio/TV', correct: true, flag: 'cadena_nacional_cf' },
      { text: 'Un “stream” obligatorio donde el botón de saltar está proscripto', correct: false, flag: 'cadena_nacional' },
      { text: 'Un patch notes del “relato” con compatibilidad retroactiva', correct: false, flag: 'relato_k' },
    ],
  },
  {
    id: 'thesis_group_problem',
    question: 'Para Patilla, la tesis de RI: ¿cuál es el principal “actor desestabilizador” del proceso?',
    answers: [
      { text: 'El grupo que no coordina y deja todo para el final', correct: true, flag: 'thesis_group_problem' },
      { text: 'La doctrina “yo hago la intro” (y desaparece 3 semanas)', correct: false, flag: 'tesis_ghost_member' },
      { text: 'El equilibrio de poder en Google Docs: todos editan, nadie escribe', correct: false, flag: 'tesis_docs_war' },
    ],
  },
  {
    id: 'ceico_unpaid',
    question: 'CEICO: ¿cuál es la doctrina económica oficial del cargo?',
    tags: ['ceico'],
    answers: [
      { text: 'Trabajo no remunerado (vocación + mates)', correct: true, flag: 'ceico_unpaid' },
      { text: 'Plan Platita: te pagan en “experiencia” con inflación', correct: false, flag: 'ceico_experience_pay' },
      { text: 'FMI personal: ajustás tu dignidad y seguís', correct: false, flag: 'ceico_fmi_personal' },
    ],
  },
  {
    id: 'ceico_boss_ship',
    question: 'CEICO: tu jefe te “empareja” con una compañera para un proyecto. ¿Qué es eso en RI?',
    answers: [
      { text: 'Diplomacia informal (canales paralelos)', correct: true, flag: 'ceico_boss_ship' },
      { text: 'Un intento de alianza estratégica con cero consulta previa', correct: false, flag: 'ceico_boss_ship' },
      { text: 'Constructivismo laboral: si lo nombrás “Pachamama”, existe', correct: false, flag: 'ceico_pachamama_lore' },
    ],
  },
  {
    id: 'ort_what',
    question: 'ORT: ¿qué es realmente?',
    answers: [
      { text: 'Una institución educativa', correct: true, flag: 'ort_what' },
      { text: 'Un spawn point de nerds diplomáticos (RI edition)', correct: false, flag: 'ort_lore' },
      { text: 'Una ONU chiquita: mucho comité, poco presupuesto', correct: false, flag: 'ort_model_un' },
    ],
  },
  {
    id: 'shabbat_definition',
    question: '¿Qué es Shabat?',
    answers: [
      { text: 'Día de descanso semanal en el judaísmo', correct: true, flag: 'shabbat_definition' },
      { text: 'Un patch de balance: “hoy no se farmea, hoy se descansa”', correct: false, flag: 'shabbat_patch' },
      { text: 'Un cese al fuego doméstico (hasta nuevo aviso)', correct: false, flag: 'shabbat_ceasefire' },
    ],
  },
  {
    id: 'micky_vainilla',
    question: 'Capusotto: ¿quién es Micky Vainilla (en esencia)?',
    answers: [
      { text: 'Una parodia de pop star careta y su discurso “correcto”', correct: true, flag: 'micky_vainilla' },
      { text: 'Un canciller del marketing: sonríe, posa y evita preguntas', correct: false, flag: 'micky_vainilla_marketing' },
      { text: 'El embajador furry del soft power: “uwu, pero con jingle”', correct: false, flag: 'furry_diplomacy' },
    ],
  },
  {
    id: 'october_17',
    question: '¿Qué fue el 17 de octubre?',
    answers: [
      { text: 'Día de la Lealtad', correct: true, flag: 'october_17' },
      { text: 'Día del Descargo del Luky sobre la policia (feriado móvil)', correct: false, flag: 'luky_police_yell' },
      { text: 'Día Nacional de Arrancar en Quinta', correct: false, flag: 'start_in_5th_boni' },
    ],
  },
  {
    id: 'third_position',
    question: '¿Qué era la Tercera Posición?',
    tags: ['ri'],
    answers: [
      { text: 'Ni Washington ni Moscú', correct: true, flag: 'third_position' },
      { text: 'Ni Civ 4 ni tocar pasto (equilibrio espiritual)', correct: false, flag: 'civ4_fan' },
      { text: 'Ni Estado ni Mercado: ABITAB (la verdadera soberanía)', correct: false, flag: 'abitab_base' },
    ],
  },
  {
    id: 'patilla_summit',
    question: 'Patilla en una cumbre internacional: ¿qué hace primero?',
    answers: [
      { text: 'Saluda y sigue el protocolo (speedrun diplomático)', correct: true, flag: 'patilla_summit' },
      { text: 'Pide un micrófono para hablar de Civilization 4', correct: false, flag: 'civ4_fan' },
      { text: 'Arranca en quinta y declara “todo bajo control”', correct: false, flag: 'start_in_5th_boni' },
    ],
  },
  {
    id: 'abitab_what',
    question: 'Para Patilla, ABITAB: ¿qué es realmente?',
    tags: ['abitab'],
    answers: [
      { text: 'Su base (spawn point)', correct: true, flag: 'abitab_what' },
      { text: 'El Ministerio de Economía pero con facturas', correct: false, flag: 'abitab' },
      { text: 'Un portal interdimensional con horario comercial', correct: false, flag: 'abitab' },
    ],
  },
  {
    id: 'jazmin_who',
    question: 'Jazmín: ¿quién es?',
    answers: [
      { text: 'La perra Nazi', correct: true, flag: 'jazmin_who' },
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

function shuffleQuestionAnswers(question: Question): Question {
  return {
    ...question,
    answers: shuffleArray(question.answers),
  };
}

function selectRandomQuestions(
  questions: Question[],
  count: number,
  activeFlags: string[]
): Question[] {
  const wantsAbitabMode = activeFlags.includes('abitab_base');

  const abitabQuestions = questions.filter((q) => q.tags?.includes('abitab'));
  const otherQuestions = questions.filter((q) => !q.tags?.includes('abitab'));

  const picked: Question[] = [];

  if (wantsAbitabMode) {
    const desiredAbitab = Math.min(2, count, abitabQuestions.length);
    picked.push(...shuffleArray(abitabQuestions).slice(0, desiredAbitab));
  }

  const remaining = count - picked.length;
  const remainingPool = otherQuestions.filter(
    (q) => !picked.some((p) => p.id === q.id)
  );
  picked.push(...shuffleArray(remainingPool).slice(0, remaining));

  return shuffleArray(picked).map(shuffleQuestionAnswers);
}

export function CoreGame({ onNavigate }: CoreGameProps) {
  const { state, dispatch } = useGame();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [outcomeText, setOutcomeText] = useState('');
  const [outcomeImageFlags, setOutcomeImageFlags] = useState<string[]>([]);
  const [outcomeWasCorrect, setOutcomeWasCorrect] = useState<boolean | null>(null);
  const [outcomeCorruptionDelta, setOutcomeCorruptionDelta] = useState<number>(0);
  const [selectedQuestions] = useState<Question[]>(() =>
    selectRandomQuestions(placeholderQuestions, state.maxQuestions, state.historyFlags)
  );

  const currentQ = selectedQuestions[state.currentQuestion];
  const isComplete = state.currentQuestion >= state.maxQuestions || !currentQ;

  if (isComplete) {
    const dominantTheme = getDominantTheme(state.historyFlags);
    const debriefLine = pickText(coreDebrief as TextEntry[], state.historyFlags);
    const totalAnswers = state.correctAnswers + state.wrongAnswers;
    const accuracy = totalAnswers > 0 ? Math.round((state.correctAnswers / totalAnswers) * 100) : 0;
    return (
      <div className="core-game">
        <StageImage corruption={state.corruption} historyFlags={state.historyFlags} />
        <div className="game-content">
          <button onClick={() => onNavigate('MainMenu')}>Volver al Menú</button>
          <h2>Juicio de Cristina con Patilla</h2>
          <div className="core-meter">
            <div className="core-meter-top">
              <span>Estabilidad del timeline</span>
              <span>{Math.max(0, 100 - state.corruption * 20)}%</span>
            </div>
            <div className="core-meter-track">
              <div
                className="core-meter-fill"
                style={{ width: `${Math.max(0, 100 - state.corruption * 20)}%` }}
              />
            </div>
          </div>
          <div className="judgment-stats">
            <p>Corrupción: {state.corruption}/5</p>
            <p>Respuestas Correctas: {state.correctAnswers}</p>
            <p>Respuestas Incorrectas: {state.wrongAnswers}</p>
            <p>Precisión: {accuracy}%</p>
            {dominantTheme && <p>Tema dominante: {dominantTheme}</p>}
          </div>
          <div className="verdict">{debriefLine}</div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('FinalJudgment')}>Dictamen final</button>
            <button onClick={() => onNavigate('MainMenu')}>Volver al Menú</button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="core-game">
        <StageImage corruption={state.corruption} historyFlags={state.historyFlags} />
        <div className="game-content">
          <button onClick={() => onNavigate('MainMenu')}>Volver al Menú</button>
          <h2>Cargando preguntas...</h2>
        </div>
      </div>
    );
  }

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    const answer = currentQ.answers[index];
    setSelectedAnswer(index);
    setOutcomeImageFlags(answer.flag ? [answer.flag] : []);

    const newCorruption = answer.correct
      ? state.corruption
      : Math.min(state.corruption + 1, 5);
    
    const newFlags = answer.flag
      ? [...state.historyFlags, answer.flag]
      : state.historyFlags;

    dispatch({
      type: 'ANSWER_QUESTION',
      payload: {
        correct: answer.correct,
        flag: answer.flag,
      },
    });

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

    const outcomeFlags = answer.flag ? [answer.flag] : newFlags;
    const selectedText = pickText(textPool, outcomeFlags);
    setOutcomeWasCorrect(answer.correct);
    setOutcomeCorruptionDelta(newCorruption - state.corruption);
    setOutcomeText(selectedText);
    setShowOutcome(true);
  };

  const handleContinue = () => {
    dispatch({ type: 'NEXT_QUESTION' });
    setSelectedAnswer(null);
    setShowOutcome(false);
    setOutcomeText('');
    setOutcomeImageFlags([]);
    setOutcomeWasCorrect(null);
    setOutcomeCorruptionDelta(0);
  };

  return (
    <div className="core-game">
      <StageImage corruption={state.corruption} historyFlags={state.historyFlags} />
      <div className="game-content">
        <div className="question-header">
          <p>
            Pregunta {state.currentQuestion + 1} de {state.maxQuestions}
          </p>
          <button onClick={() => onNavigate('MainMenu')}>Volver al Menú</button>
        </div>
        <div className="core-meter" style={{ marginBottom: '1.25rem' }}>
          <div className="core-meter-top">
            <span>Estabilidad del timeline</span>
            <span>{Math.max(0, 100 - state.corruption * 20)}%</span>
          </div>
          <div className="core-meter-track">
            <div
              className="core-meter-fill"
              style={{ width: `${Math.max(0, 100 - state.corruption * 20)}%` }}
            />
          </div>
        </div>
        <h2>{currentQ.question}</h2>
        <div className="answers">
          {currentQ.answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={
                selectedAnswer === null
                  ? ''
                  : selectedAnswer === index
                    ? `answer-selected ${answer.correct ? 'answer-correct' : 'answer-wrong'}`
                    : answer.correct
                      ? 'answer-reveal-correct'
                      : 'answer-dim'
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
                {outcomeWasCorrect !== null && (
                  <div className={`outcome-badge ${outcomeWasCorrect ? 'ok' : 'bad'}`}>
                    {outcomeWasCorrect ? 'CORRECTO' : 'INCORRECTO'}
                    <span className="outcome-badge-sub">
                      {outcomeCorruptionDelta > 0
                        ? `Corrupción +${outcomeCorruptionDelta}`
                        : 'Corrupción +0'}
                    </span>
                  </div>
                )}
                <StageImage 
                  corruption={state.corruption} 
                  historyFlags={outcomeImageFlags}
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
