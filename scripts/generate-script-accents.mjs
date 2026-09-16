/**
 * Generates static SVG path data for the handwritten accent lines.
 *
 *   node scripts/generate-script-accents.mjs
 *
 * Why this exists
 * ---------------
 * The client's print collateral uses a handwritten script for a handful of accent
 * lines. Loading a third webfont for four or five decorative strings is a bad trade:
 * it costs a render-blocking request, a third family in the loading budget, and a
 * guaranteed FOUT on the exact elements most likely to be above the fold.
 *
 * Instead we convert those strings to outlines once, at build time, and ship static
 * path data. No webfont, no FOUT, no layout shift. Only the accents used on a given
 * page are bundled, because the data is a plain module the bundler can tree-shake.
 *
 * Source face: Parisienne, SIL Open Font License 1.1 (assets/fonts/Parisienne-OFL.txt).
 * The TTF lives in assets/fonts/ as a BUILD-TIME input only. It is never copied to
 * public/ and never served to a browser.
 *
 * Changing a string here means regenerating — the text is baked into the geometry.
 * Deliberately keep owner-editable values (years, prices) OUT of the paths; render
 * them as live text beside the accent.
 */

import opentype from 'opentype.js';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const FONT_PATH = path.join(process.cwd(), 'assets/fonts/Parisienne.ttf');
const OUT_PATH = path.join(process.cwd(), 'src/components/brand/script-accents.ts');

/**
 * Generation em size. Arbitrary in itself — the SVG scales via viewBox — but it sets
 * the coordinate magnitude, and together with PRECISION it sets relative accuracy.
 * 24 with 1 decimal gives ~0.004em precision: invisible at any size we render, and
 * roughly a third the bytes of generating at 100.
 */
const FONT_SIZE = 24;
const PRECISION = 1;

const ACCENTS = [
  { id: 'nowBooking', text: 'Now Booking' },
  { id: 'enjoyYourDay', text: 'Let us manage the details so you can enjoy your day' },
  { id: 'startingAt', text: 'Starting at' },
  { id: 'checkAvailability', text: 'Message us today to check availability' },
  { id: 'servingHowell', text: 'Proudly serving Howell, Michigan' },
];

const buf = fs.readFileSync(FONT_PATH);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

const out = [];
for (const { id, text } of ACCENTS) {
  const measured = font.getPath(text, 0, 0, FONT_SIZE).getBoundingBox();
  const pad = FONT_SIZE * 0.06; // breathing room for glyph overhang
  const d = font
    .getPath(text, -measured.x1 + pad, -measured.y1 + pad, FONT_SIZE)
    .toPathData(PRECISION);
  const w = +(measured.x2 - measured.x1 + pad * 2).toFixed(2);
  const h = +(measured.y2 - measured.y1 + pad * 2).toFixed(2);
  const brotli = zlib.brotliCompressSync(d).length;
  out.push({ id, text, d, w, h });
  console.log(
    `${id.padEnd(20)} ${String(d.length).padStart(6)}B raw  ${String(brotli).padStart(5)}B brotli  viewBox 0 0 ${w} ${h}`,
  );
}

const file = `// AUTO-GENERATED — do not edit by hand.
// Regenerate with: node scripts/generate-script-accents.mjs
//
// Handwritten accent lines from the client's print collateral, converted from
// Parisienne (SIL Open Font License 1.1 — see assets/fonts/Parisienne-OFL.txt)
// into static SVG outlines. Ships no webfont and cannot FOUT.
//
// The text is baked into the path geometry, so adding or editing a line means
// regenerating this file. Years, prices and other owner-editable values are
// deliberately excluded and rendered as live text beside the accent.

export type ScriptAccentId =
${out.map((o) => `  | '${o.id}'`).join('\n')};

export interface ScriptAccentGlyph {
  /** The literal text. Used verbatim as the accessible label. */
  readonly text: string;
  /** SVG path data. */
  readonly d: string;
  /** Intrinsic viewBox width. */
  readonly w: number;
  /** Intrinsic viewBox height. */
  readonly h: number;
}

export const SCRIPT_ACCENTS: Record<ScriptAccentId, ScriptAccentGlyph> = {
${out
  .map(
    (o) => `  ${o.id}: {
    text: ${JSON.stringify(o.text)},
    w: ${o.w},
    h: ${o.h},
    d: ${JSON.stringify(o.d)},
  },`,
  )
  .join('\n')}
};
`;

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, file);

const total = out.reduce((n, o) => n + zlib.brotliCompressSync(o.d).length, 0);
console.log(`\nwrote ${path.relative(process.cwd(), OUT_PATH)}`);
console.log(`all accents, brotli: ${(total / 1024).toFixed(1)} KB (only what a page uses is bundled)`);
