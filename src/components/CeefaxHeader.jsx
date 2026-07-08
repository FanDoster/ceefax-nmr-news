import { useState, useEffect } from 'react'

export default function CeefaxHeader({ page, sub }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const pad = n => String(n).padStart(2,'0')
  const ts = `${days[time.getDay()]} ${time.getDate()} ${months[time.getMonth()]}  ${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`

  return (
    <>
      <div className="ceefax-header">
        <div className="ceefax-brand">
          <span className="c">CEE</span><span className="fax">FAX</span>
        </div>
        <div className="ceefax-pagenum">P{page}</div>
        <div className="ceefax-clock">{ts}</div>
      </div>
      <div className="ceefax-status">{sub}</div>
    </>
  )
}
