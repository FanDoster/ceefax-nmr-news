import { Link } from 'react-router-dom'

export default function CeefaxHeader({ page, sub }) {
  const now = new Date()
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const dateStr = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`

  const pad = (n) => String(n).padStart(2, '0')
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

  return (
    <>
      <div className="ceefax-header">
        <div className="brand">CEE<span>FAX</span></div>
        <div className="page-num">P{page}</div>
        <div className="date">{dateStr} <span className="ceefax-clock">{timeStr}</span></div>
      </div>
      <div className="ceefax-status">
        NMR NEWS — GOOD NEWS IN GAMES {sub && <span className="sub-page"> — {sub}</span>}
      </div>
    </>
  )
}
