import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import CeefaxHeader from '../components/CeefaxHeader'

export default function AdminPage() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState('login') // 'login' | 'signup'
  const [msg, setMsg] = useState(null)

  // Story form
  const [pageNumber, setPageNumber] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState('INDIE')
  const [stories, setStories] = useState([])
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) loadStories()
  }, [session])

  async function loadStories() {
    const { data } = await supabase
      .from('ceefax_stories')
      .select('*')
      .order('page_number', { ascending: true })
    if (data) setStories(data)
  }

  async function handleAuth(e) {
    e.preventDefault()
    setMsg(null)
    const { error } = authMode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    if (error) setMsg({ type: 'error', text: error.message })
    else if (authMode === 'signup') setMsg({ type: 'success', text: 'Account created! Check your email for confirmation.' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setMsg(null)
    const pn = parseInt(pageNumber, 10)
    if (!pn || pn < 101) {
      setMsg({ type: 'error', text: 'Page number must be 101 or higher' })
      return
    }

    const payload = { page_number: pn, title, body, category }

    if (editingId) {
      const { error } = await supabase.from('ceefax_stories').update(payload).eq('id', editingId)
      if (error) { setMsg({ type: 'error', text: error.message }); return }
      setEditingId(null)
      setMsg({ type: 'success', text: `P${pn} updated!` })
    } else {
      const { error } = await supabase.from('ceefax_stories').insert(payload)
      if (error) { setMsg({ type: 'error', text: error.message }); return }
      setMsg({ type: 'success', text: `P${pn} published!` })
    }

    setPageNumber('')
    setTitle('')
    setBody('')
    setCategory('INDIE')
    loadStories()
  }

  function editStory(s) {
    setEditingId(s.id)
    setPageNumber(String(s.page_number))
    setTitle(s.title)
    setBody(s.body)
    setCategory(s.category)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteStory(id, pn) {
    if (!confirm(`Delete P${pn}?`)) return
    const { error } = await supabase.from('ceefax_stories').delete().eq('id', id)
    if (!error) loadStories()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  // NOT LOGGED IN — show auth form
  if (!session) {
    return (
      <div className="ceefax-app">
        <CeefaxHeader page="199" sub="ADMIN LOGIN" />
        <div className="ceefax-content admin-page">
          <div className="flash-yellow" style={{ marginBottom: 16 }}>
            ADMIN ACCESS — SIGN IN TO MANAGE STORIES
          </div>

          {msg && <div className={`ceefax-msg ${msg.type}`}>{msg.text}</div>}

          <form onSubmit={handleAuth}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-ceefax">
              {authMode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
            <button
              type="button"
              className="btn-logout"
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
            >
              {authMode === 'login' ? 'Need account?' : 'Have account?'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // LOGGED IN — show story manager
  return (
    <div className="ceefax-app">
      <CeefaxHeader page="199" sub="STORY MANAGER" />

      <div className="ceefax-content admin-page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="flash-green">{editingId ? 'EDIT STORY' : 'NEW STORY'}</div>
          <button className="btn-logout" onClick={handleLogout}>LOGOUT</button>
        </div>

        {msg && <div className={`ceefax-msg ${msg.type}`}>{msg.text}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Page Number (101+)</label>
            <input type="number" min="101" value={pageNumber} onChange={e => setPageNumber(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="INDIE">INDIE</option>
              <option value="AAA">AAA</option>
              <option value="ENVIRONMENT">ENVIRONMENT</option>
              <option value="EDUCATION">EDUCATION</option>
              <option value="COMMUNITY">COMMUNITY</option>
              <option value="ACCESSIBILITY">ACCESSIBILITY</option>
              <option value="TECHNOLOGY">TECHNOLOGY</option>
              <option value="CULTURE">CULTURE</option>
            </select>
          </div>
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Body (blank line between paragraphs)</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} required />
          </div>
          <button type="submit" className="btn-ceefax">
            {editingId ? 'UPDATE STORY' : 'PUBLISH STORY'}
          </button>
          {editingId && (
            <button type="button" className="btn-logout" style={{ marginLeft: 16 }} onClick={() => {
              setEditingId(null)
              setPageNumber('')
              setTitle('')
              setBody('')
              setCategory('INDIE')
            }}>
              CANCEL
            </button>
          )}
        </form>

        <div style={{ marginTop: 32 }}>
          <div className="flash-cyan" style={{ marginBottom: 12 }}>PUBLISHED STORIES</div>
          {stories.length === 0 ? (
            <p style={{ color: 'var(--ceefax-yellow)' }}>No stories yet.</p>
          ) : (
            <ul className="headline-list">
              {stories.map(s => (
                <li key={s.id} className="headline-item">
                  <span className="headline-num">P{s.page_number}</span>
                  <span className="headline-category">{s.category}</span>
                  <span className="headline-title">{s.title}</span>
                  <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => editStory(s)}
                      style={{ background: 'none', border: '1px solid var(--ceefax-cyan)', color: 'var(--ceefax-cyan)', fontFamily: 'ModeSeven', fontSize: '0.65rem', cursor: 'pointer', padding: '2px 8px' }}
                    >
                      EDIT
                    </button>
                    <button
                      onClick={() => deleteStory(s.id, s.page_number)}
                      style={{ background: 'none', border: '1px solid var(--ceefax-red)', color: 'var(--ceefax-red)', fontFamily: 'ModeSeven', fontSize: '0.65rem', cursor: 'pointer', padding: '2px 8px' }}
                    >
                      DEL
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="ceefax-nav">
        <a href="/">← INDEX P100</a>
        <span className="nav-hint">ADMIN — P199</span>
      </div>
    </div>
  )
}
