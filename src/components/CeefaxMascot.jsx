// The NMR NEWS block-graphic mascot — a smiling teletext television, drawn
// as a 2x3-style mosaic (the authentic Ceefax "sixel" graphic look).
// Rendered as crisp pixels via image-rendering: pixelated in the CSS.
export default function CeefaxMascot() {
  return (
    <div className="ceefax-graphic">
      <img src="/images/ceefax-indie.png" alt="NMR News mascot" className="mascot-img" />
      <div className="mascot-caption">GOOD NEWS</div>
    </div>
  )
}
