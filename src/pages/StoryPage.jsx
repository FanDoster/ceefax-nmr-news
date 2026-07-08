import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import CeefaxHeader from '../components/CeefaxHeader'

export default function StoryPage() {
  const { pageNum } = useParams()
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('ceefax_stories')
      .select('*')
      .eq('page_number', pageNum)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setStory(data)
        setLoading(false)
      })
  }, [pageNum])

  if (loading) return (
    <div className="ceefax-app">
      <CeefaxHeader page={pageNum} sub="LOADING" />
      <div className="loading">LOADING...</div>
    </div>
  )

  if (!story) return (
    <div className="ceefax-app">
      <CeefaxHeader page={pageNum} sub="NOT FOUND" />
      <div className="ceefax-content">
        <div className="flash-magenta" style={{ marginBottom: 16 }}>
          PAGE NOT FOUND — P{pageNum}
        </div>
        <p style={{ color: 'var(--ceefax-white)', marginBottom: 16 }}>
          That page does not exist. Press INDEX to return to the contents.
        </p>
        <Link to="/" className="flash-cyan">INDEX P100</Link>
      </div>
    </div>
  )

  return (
    <div className="ceefax-app">
      <CeefaxHeader page={story.page_number} sub={story.category} />

      <div className="ceefax-content">
        <div className="story-header">{story.title}</div>
        <div className="story-meta">
          {story.category} — {new Date(story.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
        <div className="story-body">
          {story.body.split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      <div className="ceefax-nav">
        <Link to="/">← INDEX P100</Link>
        <span className="nav-hint">NMR NEWS — P{story.page_number}</span>
      </div>
    </div>
  )
}
