import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import CeefaxHeader from '../components/CeefaxHeader'

export default function AdminPage() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState('login')
  const [msg, setMsg] = useState(null)
  const [pageNumber, setPageNumber] = useState(''); const [title, setTitle] = useState('')
  const [body, setBody] = useState(''); const [category, setCategory] = useState('INDIE')
  const [imageUrl, setImageUrl] = useState('')
  const [stories, setStories] = useState([]); const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    supabase.auth.onAuthStateChange((_e, s) => setSession(s))
  }, [])
  useEffect(() => { if (session) loadStories() }, [session])

  async function loadStories() {
    const { data } = await supabase.from('ceefax_stories').select('*').order('page_number')
    if (data) setStories(data)
  }

  async function handleAuth(e) {
    e.preventDefault(); setMsg(null)
    const { error } = authMode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    if (error) setMsg({ type:'error', text:error.message })
    else if (authMode === 'signup') setMsg({ type:'success', text:'Account created! Check your email.' })
  }

  async function handleSubmit(e) {
    e.preventDefault(); setMsg(null)
    const pn = parseInt(pageNumber,10)
    if (!pn || pn < 101) { setMsg({type:'error',text:'Page number must be 101+'}); return }
    const payload = { page_number:pn, title, body, category, image_url:imageUrl||null }
    if (editingId) {
      const { error } = await supabase.from('ceefax_stories').update(payload).eq('id',editingId)
      if (error) { setMsg({type:'error',text:error.message}); return }
      setEditingId(null); setMsg({type:'success',text:`P${pn} updated!`})
    } else {
      const { error } = await supabase.from('ceefax_stories').insert(payload)
      if (error) { setMsg({type:'error',text:error.message}); return }
      setMsg({type:'success',text:`P${pn} published!`})
    }
    setPageNumber(''); setTitle(''); setBody(''); setCategory('INDIE'); setImageUrl('')
    loadStories()
  }

  function editStory(s) {
    setEditingId(s.id); setPageNumber(String(s.page_number)); setTitle(s.title)
    setBody(s.body); setCategory(s.category); setImageUrl(s.image_url||'')
    window.scrollTo({top:0,behavior:'smooth'})
  }

  async function deleteStory(id) {
    if (!confirm('Delete?')) return
    await supabase.from('ceefax_stories').delete().eq('id',id)
    loadStories()
  }

  if (!session) return (
    <div className="ceefax-page">
      <CeefaxHeader page="199" sub="ADMIN LOGIN  —  SIGN IN TO MANAGE STORIES" />
      <div className="admin-form">
        <div className="ceefax-hl-yellow" style={{marginBottom:14}}>ADMIN ACCESS</div>
        {msg && <div className={`ceefax-msg ${msg.type}`}>{msg.text}</div>}
        <form onSubmit={handleAuth}>
          <div className="form-row"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
          <div className="form-row"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></div>
          <button type="submit" className="btn-ceefax">{authMode==='login'?'SIGN IN':'CREATE ACCOUNT'}</button>
          <button type="button" className="btn-ceefax danger" onClick={()=>setAuthMode(authMode==='login'?'signup':'login')}>
            {authMode==='login'?'Need account?':'Have account?'}
          </button>
        </form>
        <div style={{marginTop:24}}>
          <Link to="/" className="ceefax-flash cyan">INDEX P100</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="ceefax-page">
      <CeefaxHeader page="199" sub="STORY MANAGER  —  ADD AND EDIT NMR NEWS STORIES" />
      <div className="admin-form">
        <div className="ceefax-hl-cyan">{editingId ? 'EDIT STORY' : 'NEW STORY'}</div>
        <button className="btn-ceefax danger" style={{float:'right'}} onClick={()=>supabase.auth.signOut()}>LOGOUT</button>

        {msg && <div className={`ceefax-msg ${msg.type}`}>{msg.text}</div>}

        <form onSubmit={handleSubmit} style={{clear:'both'}}>
          <div className="form-row"><label>Page Number (101+)</label><input type="number" min="101" value={pageNumber} onChange={e=>setPageNumber(e.target.value)} required /></div>
          <div className="form-row"><label>Category</label>
            <select value={category} onChange={e=>setCategory(e.target.value)}>
              <option>INDIE</option><option>AAA</option><option>ENVIRONMENT</option><option>EDUCATION</option>
              <option>COMMUNITY</option><option>ACCESSIBILITY</option><option>TECHNOLOGY</option><option>CULTURE</option>
              <option>GOVERNMENT</option>
            </select>
          </div>
          <div className="form-row"><label>Title</label><input type="text" value={title} onChange={e=>setTitle(e.target.value)} required /></div>
          <div className="form-row"><label>Body (blank line = new paragraph)</label><textarea value={body} onChange={e=>setBody(e.target.value)} required /></div>
          <div className="form-row"><label>Image URL (optional)</label><input type="text" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://..." /></div>
          <button type="submit" className="btn-ceefax">{editingId?'UPDATE STORY':'PUBLISH STORY'}</button>
          {editingId && <button type="button" className="btn-ceefax danger" onClick={()=>{
            setEditingId(null); setPageNumber(''); setTitle(''); setBody(''); setCategory('INDIE'); setImageUrl('')
          }}>CANCEL</button>}
        </form>

        <div className="admin-story-list">
          <div className="ceefax-hl-cyan" style={{fontSize:18,marginBottom:8}}>PUBLISHED STORIES</div>
          {stories.map(s => (
            <div key={s.id} className="admin-story-row">
              <span className="pn">P{s.page_number}</span>
              <span className="cat">{s.category}</span>
              <span className="title">{s.title}</span>
              <button onClick={()=>editStory(s)}>EDIT</button>
              <button className="del" onClick={()=>deleteStory(s.id)}>DEL</button>
            </div>
          ))}
        </div>

        <div style={{marginTop:20}}>
          <Link to="/" className="ceefax-flash cyan">INDEX P100</Link>
        </div>
      </div>

      <div className="ceefax-footer">
        <Link to="/">INDEX P100</Link>
        <span className="hint">ADMIN — P199</span>
      </div>
    </div>
  )
}
