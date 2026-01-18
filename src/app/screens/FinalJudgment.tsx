import { StageImage } from '../../components/StageImage';
import { useGame } from '../GameProvider';
import { pickText, getDominantTheme } from '../../utils/textPicker';
import type { Screen } from '../types';
import judgmentTitles from '../../texts/judgment/titles.json';
import judgmentVerdicts from '../../texts/judgment/verdicts.json';

interface FinalJudgmentProps {
  onNavigate: (screen: Screen) => void;
}

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

function generatePersonalizedVerdict(
  corruption: number,
  correctAnswers: number,
  wrongAnswers: number,
  dominantTheme: string | null,
  historyFlags: string[]
): string {
  const totalAnswers = correctAnswers + wrongAnswers;
  const accuracy = totalAnswers > 0 ? correctAnswers / totalAnswers : 0;
  
  // Narrativa basada en corrupción
  let corruptionNarrative = '';
  if (corruption === 0) {
    corruptionNarrative = 'Mantuviste la línea temporal intacta.';
  } else if (corruption <= 2) {
    corruptionNarrative = 'La corrupción histórica es mínima, pero presente.';
  } else if (corruption <= 4) {
    corruptionNarrative = 'La realidad se ha distorsionado significativamente.';
  } else {
    corruptionNarrative = 'El colapso temporal es inminente.';
  }

  // Narrativa basada en tema dominante
  let themeNarrative = '';
  if (dominantTheme) {
    const themeNames: Record<string, string> = {
      abitab: 'ABITAB',
      civ4: 'Civilization 4',
      furry: 'diplomacia furry',
      relato_k: 'el relato K',
      tesis: 'la tesis de RI',
      ceico: 'CEICO',
      abuela: 'la abuela y los cuetes',
      boca: 'Boca',
      jazmin: 'Jazmín',
    };
    themeNarrative = ` Tu obsesión con ${themeNames[dominantTheme] || dominantTheme} ha marcado tu camino.`;
  }

  // Narrativa basada en accuracy
  let accuracyNarrative = '';
  if (accuracy >= 0.8) {
    accuracyNarrative = 'Tu conocimiento histórico es sólido.';
  } else if (accuracy >= 0.5) {
    accuracyNarrative = 'Tu comprensión es parcial pero funcional.';
  } else {
    accuracyNarrative = 'La confusión histórica te consume.';
  }

  return `${corruptionNarrative}${themeNarrative} ${accuracyNarrative} ${pickText(judgmentVerdicts as string[], historyFlags)}`;
}

export function FinalJudgment({ onNavigate }: FinalJudgmentProps) {
  const { state } = useGame();
  const dominantTheme = getDominantTheme(state.historyFlags);

  // Título basado en corrupción y tema dominante
  const selectedTitle = pickText(judgmentTitles as string[], state.historyFlags);
  const personalizedVerdict = generatePersonalizedVerdict(
    state.corruption,
    state.correctAnswers,
    state.wrongAnswers,
    dominantTheme,
    state.historyFlags
  );

  return (
    <div className="final-judgment">
      <StageImage corruption={state.corruption} historyFlags={state.historyFlags} />
      <div className="game-content">
        <button onClick={() => onNavigate('MainMenu')}>Volver al Menú</button>
        <h1>{selectedTitle}</h1>
        <div className="judgment-stats">
          <p>Corrupción: {state.corruption}/5</p>
          <p>Respuestas Correctas: {state.correctAnswers}</p>
          <p>Respuestas Incorrectas: {state.wrongAnswers}</p>
          {state.alignment && (
            <p>
              Alineamiento: {alignmentLabels[state.alignment] ?? state.alignment}
            </p>
          )}
          {state.historyFlags.length > 0 && (
            <div>
              <p style={{ marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                Errores Temáticos Registrados ({state.historyFlags.length}):
              </p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}>
                {state.historyFlags.map((flag, idx) => {
                  const isDominant = dominantTheme && (
                    (dominantTheme === 'abitab' && ['abitab', 'abitab_base'].includes(flag)) ||
                    (dominantTheme === 'civ4' && flag === 'civ4_fan') ||
                    (dominantTheme === 'furry' && flag === 'furry_diplomacy') ||
                    (dominantTheme === 'relato_k' && ['relato_k', 'cadena_nacional'].includes(flag)) ||
                    (dominantTheme === 'tesis' && ['tesis_ghost_member', 'tesis_docs_war'].includes(flag)) ||
                    (dominantTheme === 'ceico' && ['ceico_experience_pay', 'ceico_fmi_personal', 'ceico_boss_ship', 'ceico_pachamama_lore'].includes(flag)) ||
                    (dominantTheme === 'abuela' && flag === 'abuela_cuetes') ||
                    (dominantTheme === 'boca' && flag === 'boca_duelo') ||
                    (dominantTheme === 'jazmin' && flag === 'jazmin_dog')
                  );
                  return (
                    <span
                      key={idx}
                      style={{
                        padding: '0.3rem 0.6rem',
                        background: isDominant 
                          ? 'rgba(251, 191, 36, 0.3)' 
                          : 'rgba(196, 30, 58, 0.2)',
                        border: isDominant
                          ? '1px solid rgba(251, 191, 36, 0.5)'
                          : '1px solid rgba(196, 30, 58, 0.4)',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-body)',
                        fontWeight: isDominant ? '600' : '400',
                      }}
                    >
                      {flag}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {dominantTheme && (
          <div style={{
            margin: '1.5rem 0',
            padding: '1rem',
            background: 'rgba(251, 191, 36, 0.1)',
            border: '2px solid rgba(251, 191, 36, 0.3)',
            borderLeft: '4px solid var(--color-accent)',
          }}>
            <p style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>
              <strong>Tema Dominante:</strong> {dominantTheme}
            </p>
          </div>
        )}
        <div className="verdict">
          {personalizedVerdict}
        </div>
      </div>
    </div>
  );
}
