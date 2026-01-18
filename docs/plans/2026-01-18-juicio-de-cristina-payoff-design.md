## Goal
Increase end-of-run payoff with a “final boss” ending that is:

- Fully client-side (no services)
- Shareable via URL + QR
- Replayable via multiple discrete endings
- Compatible with existing `historyFlags` + tag-based text system

## User-facing flow
- The user reaches `FinalJudgment` (“Juicio de Cristina con Patilla”).
- The screen shows:
  - A stability meter derived from corruption
  - A dossier (“Expediente”) with dynamic sections: charges, evidence, witnesses, sentence
  - A discrete ending (one of several)
  - A shareable certificate card with a real QR and a “Download PNG” button
- The QR links to `/#cert=<payload>` and opens the same certificate/ending view without requiring game state.

## Data model (share payload)
`CertificatePayloadV1` (base64url JSON in the hash):

- `v`: version
- `issuedAt`: timestamp
- `corruption`, `correctAnswers`, `wrongAnswers`
- `alignment`
- `flags` (truncated)

## Determinism
Share links must be stable. For shared views, text selection uses a seeded RNG (`mulberry32`) derived from a hash of the encoded payload (FNV-1a).

## Endings (C)
Endings are stored in `src/texts/judgment/endings.json` and selected by rules:

- ABITAB override if `abitab_base`/`abitab`
- Furry override if `furry_diplomacy`
- Otherwise based on corruption + accuracy thresholds

## Dossier (A)
Dossier pools are stored in `src/texts/judgment/dossier.json` and selected by:

- Tag match against flags
- Seeded selection for shareable determinism
- A small amount of rule-based augmentation (e.g. high corruption adds an aggravated charge)

## Certificate + QR (B)
- Certificate is a styled DOM card rendered in `FinalJudgment`.
- QR is generated client-side via `qrcode.react` pointing to the share URL.
- PNG download uses `html-to-image` to export the DOM card.

## Files
- `src/utils/certCodec.ts`: payload encode/decode + URL + seeded RNG helpers
- `src/utils/textPicker.ts`: seeded text picker (`pickTextSeeded`)
- `src/texts/judgment/endings.json`: discrete endings
- `src/texts/judgment/dossier.json`: dossier pools
- `src/app/screens/FinalJudgment.tsx`: orchestrates the full payoff + share mode
- `src/App.tsx`: deep-links `#cert=` into `FinalJudgment` and clears the hash when leaving

