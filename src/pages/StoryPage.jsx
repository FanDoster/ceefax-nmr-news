import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabase'
import CeefaxHeader from '../components/CeefaxHeader'
import CeefaxMascot from '../components/CeefaxMascot'
import Fastext from '../components/Fastext'

// The local reference PNGs are full-page screenshots, not mosaic graphics —
// never show one shrunk into the graphic column. Real external images are fine.
const isFullPageShot = url => /\/ceefax-(p\d+|indie)\.png$/i.test(url || '')

export default function StoryPage() {
  const { pageNum } = useParams()
  const [story, setStory] = useState(null)
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('ceefax_stories').select('*').eq('page_number', pageNum).single()
      .then(({ data }) => { if (data) setStory(data); setLoading(false) })
    supabase.from('ceefax_stories').select('page_number').order('page_number')
      .then(({ data }) => { if (data) setPages(data.map(p => p.page_number)) })
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

  // prev / next around the current page, wrapping within the real story list
  const idx = pages.indexOf(story.page_number)
  const prevPn = pages.length ? pages[(idx - 1 + pages.length) % pages.length] : story.page_number
  const nextPn = pages.length ? pages[(idx + 1) % pages.length] : story.page_number
  const showImage = story.image_url && !isFullPageShot(story.image_url)

  return (
    <div className="ceefax-page">
      <CeefaxHeader page={story.page_number}
        sub={`NMR NEWS  —  ${story.category}  —  ${story.title.toUpperCase().slice(0,40)}`} />

      <div className="ceefax-content">
        {showImage ? (
          <div className="ceefax-graphic">
            <img src={story.image_url} alt="" />
          </div>
        ) : (
          <CeefaxMascot />
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

      <Fastext links={[
        { color: 'red',    label: 'INDEX', to: '/' },
        { color: 'green',  label: `PREV`,  to: `/story/${prevPn}` },
        { color: 'yellow', label: `NEXT`,  to: `/story/${nextPn}` },
        { color: 'cyan',   label: 'ADMIN', to: '/admin' },
      ]} />
    </div>
  )
}
