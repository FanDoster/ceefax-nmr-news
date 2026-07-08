// "NMR" drawn as chunky teletext block letters — the SAA5050 sixel-mosaic
// look, one bright teletext colour per letter. Each glyph is a 5x5 bitmap;
// a '1' lights that block. Rendered as crisp SVG rects.
const GLYPHS = [
  { color: 'var(--C)', rows: ['10001', '11001', '10101', '10011', '10001'] }, // N — cyan
  { color: 'var(--Y)', rows: ['10001', '11011', '10101', '10001', '10001'] }, // M — yellow
  { color: 'var(--G)', rows: ['11110', '10001', '11110', '10010', '10001'] }, // R — green
]
const LW = 5   // letter width in cells
const GAP = 1  // blank columns between letters

export default function NmrLogo() {
  const rects = []
  GLYPHS.forEach((g, gi) => {
    const xOff = gi * (LW + GAP)
    g.rows.forEach((row, y) => {
      ;[...row].forEach((cell, x) => {
        if (cell === '1') {
          rects.push(
            <rect key={`${gi}-${x}-${y}`} x={xOff + x} y={y} width="1" height="1" fill={g.color} />
          )
        }
      })
    })
  })
  const totalW = GLYPHS.length * LW + (GLYPHS.length - 1) * GAP
  return (
    <svg className="nmr-logo" viewBox={`0 0 ${totalW} ${GLYPHS[0].rows.length}`}
      shapeRendering="crispEdges" role="img" aria-label="NMR">
      {rects}
    </svg>
  )
}
