import { SCRIPT_ACCENTS, type ScriptAccentId } from './script-accents';

interface ScriptAccentProps {
  /** Which handwritten line to render. */
  id: ScriptAccentId;
  /**
   * Hide from assistive technology. Use when the same words already appear as real
   * text next to the accent, so a screen reader would otherwise hear them twice.
   * Defaults to false — the accent is usually the only copy of its words.
   */
  decorative?: boolean;
  className?: string;
}

/**
 * A handwritten accent line, rendered as static SVG outlines.
 *
 * There is no script webfont on this site. These five lines are converted from
 * Parisienne at build time (see scripts/generate-script-accents.mjs), so they ship
 * as path data with no font request, no FOUT and no layout shift.
 *
 * Color comes from `currentColor`, so it follows the surrounding text color:
 *   light surfaces -> text-gold-ink   (Brand Gold fails contrast as text on cream)
 *   dark surfaces  -> text-softgold
 *
 * Size with a height utility; width follows the aspect ratio automatically.
 *
 *   <ScriptAccent id="nowBooking" className="h-10 text-gold-ink" />
 *
 * Per the design system, at most one script accent per viewport, never below 20px,
 * and never for anything the user has to act on.
 */
export function ScriptAccent({ id, decorative = false, className }: ScriptAccentProps) {
  const glyph = SCRIPT_ACCENTS[id];

  return (
    <svg
      // Intrinsic dimensions let the browser reserve space before CSS resolves,
      // which is what keeps this out of CLS.
      width={glyph.w}
      height={glyph.h}
      viewBox={`0 0 ${glyph.w} ${glyph.h}`}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={{ width: 'auto' }}
      {...(decorative
        ? { 'aria-hidden': true as const }
        : { role: 'img' as const, 'aria-label': glyph.text })}
    >
      <path d={glyph.d} fill="currentColor" />
    </svg>
  );
}
