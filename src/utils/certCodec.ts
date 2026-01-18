export interface CertificatePayloadV1 {
  v: 1;
  issuedAt: number;
  corruption: number;
  correctAnswers: number;
  wrongAnswers: number;
  alignment: string | null;
  flags: string[];
}

function clampInt(value: unknown, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.trunc(n)));
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecodeToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function encodeCertificatePayload(payload: CertificatePayloadV1): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  return base64UrlEncode(bytes);
}

export function decodeCertificatePayload(encoded: string): CertificatePayloadV1 | null {
  try {
    const bytes = base64UrlDecodeToBytes(encoded);
    const json = new TextDecoder().decode(bytes);
    const parsed: unknown = JSON.parse(json);

    if (!parsed || typeof parsed !== 'object') return null;
    const obj = parsed as Record<string, unknown>;
    if (obj.v !== 1) return null;

    const flags = isStringArray(obj.flags) ? obj.flags.slice(0, 24) : [];

    return {
      v: 1,
      issuedAt: clampInt(obj.issuedAt, 0, 4_102_444_800_000),
      corruption: clampInt(obj.corruption, 0, 5),
      correctAnswers: clampInt(obj.correctAnswers, 0, 99),
      wrongAnswers: clampInt(obj.wrongAnswers, 0, 99),
      alignment: typeof obj.alignment === 'string' ? obj.alignment : null,
      flags,
    };
  } catch {
    return null;
  }
}

export function readCertificateFromHash(hash: string): CertificatePayloadV1 | null {
  const trimmed = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!trimmed) return null;
  const parts = trimmed.split('&').map((part) => part.trim());
  const certPart = parts.find((part) => part.startsWith('cert='));
  if (!certPart) return null;
  const encoded = certPart.slice('cert='.length);
  if (!encoded) return null;
  return decodeCertificatePayload(encoded);
}

export function buildCertificateShareUrl(encoded: string): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#cert=${encoded}&dl=1`;
}

export function hasCertificateDownloadFlag(hash: string): boolean {
  const trimmed = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!trimmed) return false;
  return trimmed.split('&').some((part) => part.trim().toLowerCase() === 'dl=1');
}

export function clearCertificateHash(): void {
  const { origin, pathname, search } = window.location;
  window.history.replaceState(null, '', `${origin}${pathname}${search}`);
}

export function fnv1a32(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

