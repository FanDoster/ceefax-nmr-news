import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import CeefaxHeader from '../components/CeefaxHeader'

export default function StoryPage() {
  const { pageNum } = useParams()
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('ceefax_stories').select('*').eq('page_number', pageNum).single()
      .then(({ data }) => { if (data) setStory(data); setLoading(false) })
  }, [pageNum])

  if (loading) return (
    <div className="ceefax-page">
      <CeefaxHeader page={pageNum} sub="LOADING..." />
      <div className="ceefax-loading">LOADING...</div>
    </div>
  )
  if (!story) return (
    <div className="ceefax-page">
      <CeefaxHeader page={pageNum} sub="PAGE NOT FOUND" />
      <div className="ceefax-content">
        <div className="ceefax-text">
          <div className="ceefax-hl-yellow">PAGE NOT FOUND</div>
          <div className="ceefax-body">That Ceefax page does not exist.</div>
          <Link to="/" className="ceefax-flash cyan">INDEX P100</Link>
        </div>
      </div>
    </div>
  )

  const nextPn = story.page_number >= 111 ? 101 : story.page_number + 1

  return (
    <div className="ceefax-page">
      <CeefaxHeader page={story.page_number}
        sub={`NMR NEWS  —  ${story.category}  —  ${story.title.toUpperCase().slice(0,40)}`} />

      <div className="ceefax-content">
        {story.image_url ? (
          <div className="ceefax-graphic">
            <img src={story.image_url} alt="" />
          </div>
        ) : (
          <div className="ceefax-graphic">
            <pre style={{color:'var(--C)',fontSize:10,lineHeight:1.1,margin:0}}>
{` KKKKKKKKKKKKKKKKKKKKK
 KKKKKK  WWW  KKKKKKK
 KKKKKK WCCCW KKKKKKK
 KKKKK WWWWWWW KKKKKK
 KKKKK WCCCCCW KKKKKK
 KKKKK WCCWCW KKKKKKK
 KKKKK WWWWWWW KKKKKK
 KKKKKKK WWW KKKKKKKK`}
            </pre>
          </div>
        )}

        <div className="ceefax-text">
          <div className="ceefax-hl-cyan">{story.title.toUpperCase()}</div>
          <div className="ceefax-hl-yellow">
            {story.category} — {new Date(story.created_at).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}).toUpperCase()}
          </div>

          {story.body.split('\n\n').map((p, i) => (
            <div key={i} className="ceefax-body">{p}</div>
          ))}

          <div style={{marginTop:12}}>
            <span className={`ceefax-flash ${story.category === 'ENVIRONMENT' ? 'green' : story.category === 'EDUCATION' ? 'magenta' : story.category === 'CULTURE' ? 'magenta' : story.category === 'GOVERNMENT' ? 'cyan' : 'cyan'}`}>
              {story.category}
            </span>
          </div>
        </div>
      </div>

      <div className="ceefax-footer">
        <Link to="/">INDEX P100</Link>
        <span className="hint">NMR NEWS — P{story.page_number}</span>
        <Link to={`/story/${nextPn}`} className="next">P{nextPn}  NEXT</Link>
      </div>
    </div>
  )
}
