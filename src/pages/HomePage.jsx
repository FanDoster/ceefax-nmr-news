import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import CeefaxHeader from '../components/CeefaxHeader'
import CeefaxMascot from '../components/CeefaxMascot'
import Fastext from '../components/Fastext'

export default function HomePage() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    supabase.auth.onAuthStateChange((_e, s) => setSession(s))

    supabase.from('ceefax_stories')
      .select('page_number, title, category')
      .order('page_number')
      .then(({ data }) => { if (data) setStories(data); setLoading(false) })
  }, [])

  if (loading) return (
    <div className="ceefax-page">
      <CeefaxHeader page="100" sub="NMR NEWS  —  GOOD NEWS IN GAMES" />
      <div className="ceefax-loading">LOADING...</div>
    </div>
  )

  const first = stories[0]?.page_number ?? 101
  const last = stories[stories.length - 1]?.page_number ?? 101

  return (
    <div className="ceefax-page">
      <CeefaxHeader page="100" sub="NMR NEWS  —  GOOD NEWS IN GAMES" />

      <div className="ceefax-content">
        <CeefaxMascot />

        <div className="index-stories">
          <div className="ceefax-hl-cyan">NMR NEWS</div>
          <div className="ceefax-hl-yellow">GOOD GAMES NEWS</div>

          {stories.map(s => (
            <div key={s.page_number} className="index-story-row" onClick={() => navigate(`/story/${s.page_number}`)}>
              <span className="index-pn">P{s.page_number}</span>
              <span className="index-cat">{s.category}</span>
              <span className="index-title">{s.title}</span>
            </div>
          ))}

          {session && (
            <div style={{ marginTop: 12 }}>
              <span className="ceefax-flash red" style={{cursor:'pointer'}}
                onClick={() => supabase.auth.signOut()}>LOGOUT</span>
            </div>
          )}
        </div>
      </div>

      <Fastext links={[
        { color: 'red',    label: 'HEADLINES', to: `/story/${first}` },
        { color: 'green',  label: 'ADMIN',     to: '/admin' },
        { color: 'yellow', label: 'LATEST',    to: `/story/${last}` },
        { color: 'cyan',   label: 'INDEX',     to: '/' },
      ]} />
    </div>
  )
}
