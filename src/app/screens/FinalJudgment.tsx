import { useMemo, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { StageImage } from '../../components/StageImage';
import { useGame } from '../useGame';
import {
  getDominantTheme,
  pickText,
  pickTextSeeded,
  type TextEntry,
} from '../../utils/textPicker';
import type { Screen } from '../types';
import judgmentTitles from '../../texts/judgment/titles.json';
import judgmentVerdicts from '../../texts/judgment/verdicts.json';
import endings from '../../texts/judgment/endings.json';
import dossier from '../../texts/judgment/dossier.json';
import {
  buildCertificateShareUrl,
  encodeCertificatePayload,
  fnv1a32,
  mulberry32,
  readCertificateFromHash,
  type CertificatePayloadV1,
} from '../../utils/certCodec';

interface FinalJudgmentProps {
  onNavigate: (screen: Screen) => void;
}

interface EndingEntry {
  id: string;
  title: string;
  text: string;
  tags?: string[];
}

interface DossierData {
  charges: TextEntry[];
  evidence: TextEntry[];
  witnesses: TextEntry[];
  sentences: TextEntry[];
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
  historyFlags: string[],
  random?: () => number
): string {
  const totalAnswers = correctAnswers + wrongAnswers;
  const accuracy = totalAnswers > 0 ? correctAnswers / totalAnswers : 0;

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

  let accuracyNarrative = '';
  if (accuracy >= 0.8) {
    accuracyNarrative = 'Tu conocimiento histórico es sólido.';
  } else if (accuracy >= 0.5) {
    accuracyNarrative = 'Tu comprensión es parcial pero funcional.';
  } else {
    accuracyNarrative = 'La confusión histórica te consume.';
  }

  const verdictPool = judgmentVerdicts as unknown as TextEntry[];
  const verdict = random
    ? pickTextSeeded(verdictPool, historyFlags, random)
    : pickText(verdictPool, historyFlags);

  return `${corruptionNarrative}${themeNarrative} ${accuracyNarrative} ${verdict}`;
}

function getEnding(
  allEndings: EndingEntry[],
  flags: string[],
  corruption: number,
  accuracyPct: number
): EndingEntry {
  const hasAbitab = flags.includes('abitab_base') || flags.includes('abitab');
  const hasFurry = flags.includes('furry_diplomacy');

  if (hasAbitab) {
    const match = allEndings.find((e) => e.id === 'toma_abitab');
    if (match) return match;
  }

  if (hasFurry) {
    const match = allEndings.find((e) => e.id === 'estado_uwu');
    if (match) return match;
  }

  if (corruption <= 1 && accuracyPct >= 80) {
    const match = allEndings.find((e) => e.id === 'absolucion_prolija');
    if (match) return match;
  }

  if (corruption <= 3 && accuracyPct >= 50) {
    const match = allEndings.find((e) => e.id === 'probation_institucional');
    if (match) return match;
  }

  return allEndings.find((e) => e.id === 'condena_cursed') ?? allEndings[0];
}

function pickUniqueSeeded(
  bucket: TextEntry[],
  historyFlags: string[],
  random: () => number,
  count: number
): string[] {
  const picked = new Set<string>();
  const result: string[] = [];
  const hardLimit = Math.max(12, bucket.length * 2);

  for (let i = 0; i < hardLimit && result.length < count; i += 1) {
    const t = pickTextSeeded(bucket, historyFlags, random);
    if (!picked.has(t)) {
      picked.add(t);
      result.push(t);
    }
  }

  return result;
}

export function FinalJudgment({ onNavigate }: FinalJudgmentProps) {
  const { state } = useGame();
  const [showShare, setShowShare] = useState(false);
  const [issuedAt] = useState(() => Date.now());
  const certificateRef = useRef<HTMLDivElement | null>(null);

  const certFromHash = readCertificateFromHash(window.location.hash);
  const effective: CertificatePayloadV1 = certFromHash ?? {
    v: 1,
    issuedAt,
    corruption: state.corruption,
    correctAnswers: state.correctAnswers,
    wrongAnswers: state.wrongAnswers,
    alignment: state.alignment,
    flags: state.historyFlags,
  };

  const dominantTheme = getDominantTheme(effective.flags);
  const totalAnswers = effective.correctAnswers + effective.wrongAnswers;
  const accuracyPct =
    totalAnswers > 0 ? Math.round((effective.correctAnswers / totalAnswers) * 100) : 0;
  const stabilityPct = Math.max(0, 100 - effective.corruption * 20);

  const share = useMemo(() => {
    const payload: CertificatePayloadV1 = {
      v: 1,
      issuedAt: effective.issuedAt,
      corruption: effective.corruption,
      correctAnswers: effective.correctAnswers,
      wrongAnswers: effective.wrongAnswers,
      alignment: effective.alignment,
      flags: effective.flags.slice(0, 24),
    };
    const encoded = encodeCertificatePayload(payload);
    const url = buildCertificateShareUrl(encoded);
    const seed = fnv1a32(encoded);
    return { payload, encoded, url, seed };
  }, [
    effective.issuedAt,
    effective.corruption,
    effective.correctAnswers,
    effective.wrongAnswers,
    effective.alignment,
    effective.flags,
  ]);

  const titleText = useMemo(() => {
    if (certFromHash) {
      const rng = mulberry32(share.seed ^ 0x2c1b3c6d);
      return pickTextSeeded(judgmentTitles as unknown as TextEntry[], effective.flags, rng);
    }
    return pickText(judgmentTitles as unknown as TextEntry[], effective.flags);
  }, [certFromHash, effective.flags, share.seed]);

  const endingEntry = useMemo(() => {
    return getEnding(endings as unknown as EndingEntry[], effective.flags, effective.corruption, accuracyPct);
  }, [accuracyPct, effective.corruption, effective.flags]);

  const dossierData = dossier as unknown as DossierData;

  const charges = useMemo(() => {
    const rng = mulberry32(share.seed ^ 0x51c3b0a1);
    const items = pickUniqueSeeded(dossierData.charges, effective.flags, rng, 3);
    if (effective.corruption >= 4) {
      return ['Manipulación temporal agravada (corrupción histórica premium).', ...items].slice(0, 4);
    }
    return items;
  }, [dossierData.charges, effective.corruption, effective.flags, share.seed]);

  const evidence = useMemo(() => {
    const rng = mulberry32(share.seed ^ 0x1f9e3779);
    return pickUniqueSeeded(dossierData.evidence, effective.flags, rng, 4);
  }, [dossierData.evidence, effective.flags, share.seed]);

  const witnesses = useMemo(() => {
    const rng = mulberry32(share.seed ^ 0x9e3779b9);
    return pickUniqueSeeded(dossierData.witnesses, effective.flags, rng, 3);
  }, [dossierData.witnesses, effective.flags, share.seed]);

  const sentenceLine = useMemo(() => {
    const rng = mulberry32(share.seed ^ 0xa5a5a5a5);
    return pickTextSeeded(dossierData.sentences, effective.flags, rng);
  }, [dossierData.sentences, effective.flags, share.seed]);

  const personalizedVerdict = useMemo(() => {
    const rng = certFromHash ? mulberry32(share.seed ^ 0xdeadbeef) : undefined;
    return generatePersonalizedVerdict(
      effective.corruption,
      effective.correctAnswers,
      effective.wrongAnswers,
      dominantTheme,
      effective.flags,
      rng
    );
  }, [
    certFromHash,
    dominantTheme,
    effective.corruption,
    effective.correctAnswers,
    effective.flags,
    effective.wrongAnswers,
    share.seed,
  ]);

  const shareTitle = `Juicio de Cristina con Patilla — ${titleText}`;

  const handleDownloadPng = async () => {
    if (!certificateRef.current) return;
    const dataUrl = await toPng(certificateRef.current, { cacheBust: true, pixelRatio: 2 });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `juicio-de-cristina-${share.seed}.png`;
    a.click();
  };

  const handleShare = async () => {
    if (!certificateRef.current) {
      setShowShare(true);
      return;
    }
    const dataUrl = await toPng(certificateRef.current, { cacheBust: true, pixelRatio: 2 });
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], `juicio-de-cristina-${share.seed}.png`, { type: 'image/png' });
    const canShareFiles =
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      (typeof navigator.canShare !== 'function' || navigator.canShare({ files: [file] }));

    if (canShareFiles) {
      try {
        await navigator.share({
          title: shareTitle,
          text: 'Juicio de Cristina con Patilla',
          url: share.url,
          files: [file],
        });
        return;
      } catch (error) {
        console.error(error);
      }
    }
    setShowShare(true);
  };

  return (
    <div className="final-judgment">
      <StageImage corruption={effective.corruption} historyFlags={effective.flags} />
      <div className="game-content">
        <button onClick={() => onNavigate('MainMenu')}>Volver al Menú</button>
        <h1>Juicio de Cristina con Patilla</h1>
        <h3 style={{ marginTop: 0 }}>{titleText}</h3>

        <div className="core-meter">
          <div className="core-meter-top">
            <span>Estabilidad del timeline</span>
            <span>{stabilityPct}%</span>
          </div>
          <div className="core-meter-track">
            <div className="core-meter-fill" style={{ width: `${stabilityPct}%` }} />
          </div>
        </div>

        <div className="judgment-stats">
          <p>Corrupción: {effective.corruption}/5</p>
          <p>Respuestas Correctas: {effective.correctAnswers}</p>
          <p>Respuestas Incorrectas: {effective.wrongAnswers}</p>
          <p>Precisión: {accuracyPct}%</p>
          {effective.alignment && (
            <p>Alineamiento: {alignmentLabels[effective.alignment] ?? effective.alignment}</p>
          )}
          {dominantTheme && <p>Tema dominante: {dominantTheme}</p>}
        </div>

        <div className="dossier">
          <div className="dossier-header">
            <div>
              <div className="dossier-label">EXPEDIENTE</div>
              <div className="dossier-title">Causa: Timeline vs Patilla</div>
            </div>
            <div className="dossier-label">Ending: {endingEntry.title}</div>
          </div>

          <div className="dossier-grid">
            <div className="dossier-section">
              <h3>Cargos</h3>
              <ul>
                {charges.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            <div className="dossier-section">
              <h3>Pruebas</h3>
              <ul>
                {evidence.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>

            <div className="dossier-section">
              <h3>Testigos</h3>
              <ul>
                {witnesses.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>

            <div className="dossier-section">
              <h3>Sentencia</h3>
              <p style={{ margin: 0 }}>{sentenceLine}</p>
            </div>
          </div>
        </div>

        <div className="verdict">{personalizedVerdict}</div>

        <div className="ending-box">
          <div className="ending-title">{endingEntry.title}</div>
          <div className="ending-text">{endingEntry.text}</div>
        </div>

        <div className="certificate-card" ref={certificateRef}>
          <div className="certificate-title">Certificado oficial</div>
          <div className="certificate-subtitle">{shareTitle}</div>
          <div className="certificate-grid">
            <div className="certificate-row">
              <span>Estabilidad</span>
              <span>{stabilityPct}%</span>
            </div>
            <div className="certificate-row">
              <span>Corrupción</span>
              <span>{effective.corruption}/5</span>
            </div>
            <div className="certificate-row">
              <span>Precisión</span>
              <span>{accuracyPct}%</span>
            </div>
            <div className="certificate-row">
              <span>Ending</span>
              <span>{endingEntry.id}</span>
            </div>
          </div>
          <div className="certificate-qr">
            <QRCodeCanvas value={share.url} size={160} bgColor="#000000" fgColor="#fbbf24" includeMargin />
          </div>
          <div className="certificate-foot">
            Emitido: {new Date(effective.issuedAt).toLocaleString()}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleShare}>Compartir</button>
          <button onClick={handleDownloadPng}>Descargar PNG</button>
        </div>
      </div>

      {showShare && (
        <>
          <div className="outcome-backdrop" onClick={() => setShowShare(false)} />
          <div className="outcome-modal">
            <div className="outcome">
              <h3>Compartir certificado</h3>
              <div className="certificate-qr" style={{ marginTop: '1rem' }}>
                <QRCodeCanvas value={share.url} size={220} bgColor="#000000" fgColor="#fbbf24" includeMargin />
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  marginTop: '1rem',
                }}
              >
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(share.url);
                  }}
                >
                  Copiar link
                </button>
                <button onClick={() => setShowShare(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
