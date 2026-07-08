import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'
import CeefaxHeader from '../components/CeefaxHeader'

export default function HomePage() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session))

    supabase
      .from('ceefax_stories')
      .select('page_number, title, category, created_at')
      .order('page_number', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setStories(data)
        setLoading(false)
      })

    return () => subscription.unsubscribe()
  }, [])

  const cats = [...new Set(stories.map(s => s.category))]

  return (
    <div className="ceefax-app">
      <CeefaxHeader page="100" sub="INDEX" />

      <div className="ceefax-content">
        <div className="flash-cyan" style={{ marginBottom: 16, fontSize: '0.9rem' }}>
          NMR NEWS — POSITIVE STORIES FROM THE GAMES INDUSTRY
        </div>

        {loading ? (
          <div className="loading">LOADING...</div>
        ) : (
          <ul className="headline-list">
            {stories.map((s, i) => (
              <li
                key={s.page_number}
                className="headline-item"
                onClick={() => navigate(`/story/${s.page_number}`)}
              >
                <span className="headline-num">P{s.page_number}</span>
                <span className="headline-category">{s.category}</span>
                <span className="headline-title">{s.title}</span>
              </li>
            ))}
          </ul>
        )}

        {!loading && stories.length === 0 && (
          <p style={{ color: 'var(--ceefax-yellow)', padding: 24 }}>
            No stories yet. Go to <Link to="/admin">P199 ADMIN</Link> to add the first one.
          </p>
        )}
      </div>

      <div className="ceefax-nav">
        <span className="nav-hint">NMR NEWS INDEX</span>
        <span>
          {session ? (
            <>
              <Link to="/admin">Admin P199</Link>
              {' | '}
              <a href="#logout" onClick={(e) => { e.preventDefault(); supabase.auth.signOut() }}>Logout</a>
            </>
          ) : (
            <Link to="/admin">Admin P199</Link>
          )}
        </span>
      </div>
    </div>
  )
}
