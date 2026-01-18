export type TextEntry = string | { text: string; tags?: string[] };

export function pickTextSeeded(
  bucket: TextEntry[],
  historyFlags: string[] = [],
  random: () => number
): string {
  if (bucket.length === 0) {
    return 'Processing...';
  }

  const entries: TextEntry[] = bucket;

  const taggedEntries = entries.filter(
    (entry): entry is { text: string; tags: string[] } =>
      typeof entry === 'object' && Array.isArray(entry.tags)
  );

  const plainEntries = entries.filter(
    (entry): entry is string => typeof entry === 'string'
  );

  if (taggedEntries.length > 0 && historyFlags.length > 0) {
    const matchingEntries = taggedEntries.filter((entry) =>
      entry.tags.some((tag) => historyFlags.includes(tag))
    );

    if (matchingEntries.length > 0 && random() < 0.85) {
      const randomIndex = Math.floor(random() * matchingEntries.length);
      return matchingEntries[randomIndex].text;
    }
  }

  const allTexts = plainEntries.length > 0
    ? plainEntries
    : taggedEntries.map((e) => e.text);

  const randomIndex = Math.floor(random() * allTexts.length);
  return allTexts[randomIndex];
}

export function pickText(
  bucket: TextEntry[],
  historyFlags: string[] = []
): string {
  if (bucket.length === 0) {
    return 'Processing...';
  }

  const entries: TextEntry[] = bucket;

  const taggedEntries = entries.filter(
    (entry): entry is { text: string; tags: string[] } =>
      typeof entry === 'object' && Array.isArray(entry.tags)
  );

  const plainEntries = entries.filter(
    (entry): entry is string => typeof entry === 'string'
  );

  // Si hay flags, priorizar textos con tags relevantes (mayor probabilidad)
  if (taggedEntries.length > 0 && historyFlags.length > 0) {
    const matchingEntries = taggedEntries.filter((entry) =>
      entry.tags.some((tag) => historyFlags.includes(tag))
    );

    // Si hay textos que coinciden con flags, usar 85% probabilidad (antes 70%)
    // Esto hace que los flags tengan más impacto narrativo visible
    if (matchingEntries.length > 0 && Math.random() < 0.85) {
      const randomIndex = Math.floor(
        Math.random() * matchingEntries.length
      );
      return matchingEntries[randomIndex].text;
    }
  }

  // Si no hay coincidencias o falló el random, evitar tags no relacionados
  const allTexts = plainEntries.length > 0
    ? plainEntries
    : taggedEntries.map((e) => e.text);

  const randomIndex = Math.floor(Math.random() * allTexts.length);
  return allTexts[randomIndex];
}

/**
 * Obtiene el tema dominante basado en los flags
 * Agrupa flags por temas y retorna el más frecuente
 */
export function getDominantTheme(historyFlags: string[]): string | null {
  if (historyFlags.length === 0) return null;

  const themeGroups: Record<string, string[]> = {
    abitab: ['abitab', 'abitab_base'],
    civ4: ['civ4_fan'],
    furry: ['furry_diplomacy'],
    relato_k: ['relato_k', 'cadena_nacional'],
    tesis: ['tesis_ghost_member', 'tesis_docs_war'],
    ceico: ['ceico_experience_pay', 'ceico_fmi_personal', 'ceico_boss_ship', 'ceico_pachamama_lore'],
    abuela: ['abuela_cuetes'],
    boca: ['boca_duelo'],
    jazmin: ['jazmin_dog'],
  };

  const themeCounts: Record<string, number> = {};

  historyFlags.forEach((flag) => {
    for (const [theme, flags] of Object.entries(themeGroups)) {
      if (flags.includes(flag)) {
        themeCounts[theme] = (themeCounts[theme] || 0) + 1;
        break;
      }
    }
  });

  const sortedThemes = Object.entries(themeCounts).sort((a, b) => b[1] - a[1]);
  return sortedThemes.length > 0 && sortedThemes[0][1] >= 2 ? sortedThemes[0][0] : null;
}
