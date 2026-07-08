import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import CeefaxHeader from '../components/CeefaxHeader'

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

  return (
    <div className="ceefax-page">
      <CeefaxHeader page="100" sub="NMR NEWS  —  GOOD NEWS IN GAMES" />

      <div className="ceefax-content">
        <div className="index-graphic">
          <pre style={{ color:'var(--C)', fontSize:11, lineHeight:1.2, margin:0 }}>
{`  WW  WW  WW  WWW
  W W W  W W  W
  W W W  WWW  WW
  W W W  W W  W
  WW  WW  W W  WWW

   CCC EEE EEE FFF
  C    E   E   F
  C    EE  EE  FF
  C    E   E   F
   CCC EEE EEE F`}
          </pre>
        </div>

        <div className="index-stories">
          <div className="ceefax-hl-cyan">NMR NEWS INDEX</div>
          <div className="ceefax-hl-yellow">GOOD NEWS IN GAMES</div>

          {stories.map(s => (
            <div key={s.page_number} className="index-story-row" onClick={() => navigate(`/story/${s.page_number}`)}>
              <span className="index-pn">P{s.page_number}</span>
              <span className="index-cat">{s.category}</span>
              <span className="index-title">{s.title}</span>
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            {session ? (
              <span className="ceefax-flash cyan" style={{cursor:'pointer'}} onClick={() => navigate('/admin')}>
                ADMIN P199
              </span>
            ) : (
              <span className="ceefax-flash cyan" style={{cursor:'pointer'}} onClick={() => navigate('/admin')}>
                ADMIN P199
              </span>
            )}
            {session && (
              <span className="ceefax-flash red" style={{cursor:'pointer', marginLeft:8}}
                onClick={() => supabase.auth.signOut()}>LOGOUT</span>
            )}
          </div>
        </div>
      </div>

      <div className="ceefax-footer">
        <Link to="/">INDEX P100</Link>
        <span className="hint">NMR NEWS INDEX</span>
        <span className="next">{stories.length} STORIES</span>
      </div>
    </div>
  )
}
