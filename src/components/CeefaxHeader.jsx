import { useState, useEffect } from 'react'
import NmrLogo from './NmrLogo'

export default function CeefaxHeader({ page, sub }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const pad = n => String(n).padStart(2,'0')
  // Authentic Ceefax clock: date, then HH:MM/SS with the seconds after a slash
  const ts = `${days[time.getDay()]} ${pad(time.getDate())} ${months[time.getMonth()]} ${pad(time.getHours())}:${pad(time.getMinutes())}/${pad(time.getSeconds())}`

  return (
    <>
      <div className="ceefax-header">
        <div className="ceefax-brand">
          <NmrLogo />
        </div>
        <div className="ceefax-pagenum">P{page}</div>
        <div className="ceefax-clock">{ts}</div>
      </div>
      <div className="ceefax-status">{sub}</div>
    </>
  )
}
