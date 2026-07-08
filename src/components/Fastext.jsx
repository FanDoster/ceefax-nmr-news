import { useNavigate } from 'react-router-dom'

// The FASTEXT bar (teletext row 24): four coloured links mapped to the
// RED / GREEN / YELLOW / CYAN keys on the TV remote.
// `links` is an array of { color, label, to } in that fixed colour order.
export default function Fastext({ links }) {
  const navigate = useNavigate()
  return (
    <div className="ceefax-fastext">
      {links.map((l, i) => (
        <span
          key={i}
          className={`fx ${l.color}`}
          onClick={() => l.to != null && navigate(l.to)}
          role="link"
          tabIndex={0}
        >
          <span className="lbl">{l.label}</span>
        </span>
      ))}
    </div>
  )
}
