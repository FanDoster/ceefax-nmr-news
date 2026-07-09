/* Ceefax NMR News — shared vanilla JS. No framework, no build step.
   Loaded as a classic <script> after the Supabase CDN script. */
(function () {
  'use strict'

  // Supabase project. The publishable (anon) key is meant to live in the
  // client — writes are guarded by row-level security in Supabase.
  var SUPABASE_URL = 'https://exmksuzyfbhfybzoxfsg.supabase.co'
  var SUPABASE_KEY = 'sb_publishable_xnmYKAnVN0osPPz0hIsxfA_3tjaCea5'

  // window.supabase is the library global provided by the CDN <script>.
  // Pages that don't need data (e.g. the 404 page) can skip loading the CDN;
  // guard so common.js still provides the header/FASTEXT helpers without it.
  var db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null

  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  function pad(n) { return String(n).padStart(2, '0') }

  function escapeHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  }

  // Resolves after `ms`. Race it against a fetch (Promise.all) to hold the
  // "LOADING..." screen for a minimum time, like an old teletext page loading.
  function delay(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms) }) }

  // Fetch JSON with a short-lived localStorage cache so re-opening or
  // refreshing a page (weather / sport / cities) doesn't re-hit the API every
  // time. Falls back to a live fetch if the cache is stale, missing, or
  // unavailable; serves a stale copy if the network fails.
  function cachedJSON(url, ttlMs, opts) {
    var key = 'cx-cache:' + url
    var now = Date.now()
    var cached = null
    try {
      var raw = localStorage.getItem(key)
      if (raw) {
        cached = JSON.parse(raw)
        if (now - cached.t < ttlMs) return Promise.resolve(cached.d)
      }
    } catch (e) { /* storage disabled or corrupt — just fetch live */ }

    return fetch(url, opts).then(function (r) {
      // A rate-limit / server error still returns JSON (e.g. Open-Meteo's
      // {error:true,reason}). Reject it so we never cache a bad response and
      // then serve it for the whole TTL — fall through to the stale/live path.
      if (!r.ok) throw new Error('HTTP ' + r.status)
      return r.json()
    }).then(function (data) {
      if (data && data.error) throw new Error(data.reason || 'API error')
      try { localStorage.setItem(key, JSON.stringify({ t: now, d: data })) } catch (e) {}
      return data
    }).catch(function (err) {
      if (cached) return cached.d   // network died — serve the stale copy
      throw err
    })
  }

  // "NMR" as chunky teletext block letters (SAA5050 sixel-mosaic look) — the
  // masthead banner mark. Each glyph is a 5x5 bitmap; a '1' lights that block.
  function nmrLogoSVG() {
    var glyphs = [
      { color: 'var(--C)', rows: ['10001', '11001', '10101', '10011', '10001'] }, // N — cyan
      { color: 'var(--Y)', rows: ['10001', '11011', '10101', '10001', '10001'] }, // M — yellow
      { color: 'var(--G)', rows: ['11110', '10001', '11110', '10010', '10001'] }, // R — green
    ]
    var LW = 5, GAP = 1, rects = ''
    glyphs.forEach(function (g, gi) {
      var xOff = gi * (LW + GAP)
      g.rows.forEach(function (row, y) {
        row.split('').forEach(function (cell, x) {
          if (cell === '1') {
            rects += '<rect x="' + (xOff + x) + '" y="' + y + '" width="1" height="1" fill="' + g.color + '"/>'
          }
        })
      })
    })
    var w = glyphs.length * LW + (glyphs.length - 1) * GAP
    return '<svg class="nmr-logo" viewBox="0 0 ' + w + ' 5" shape-rendering="crispEdges" role="img" aria-label="NMR">' + rects + '</svg>'
  }

  // The No More Robots brand logo in teletext mosaic: their green sprout
  // (rasterised from the real logo) with the initials N / M / R stacked beside
  // it in the header letter colours (cyan / yellow / green). Used as the big
  // graphic on the index page.
  function sproutLogoSVG() {
    // 12x22 mosaic of the sprout ('#' = a lit green block).
    var SPROUT = [
      '...###......',
      '....###..###',
      '###..##.####',
      '#####..#####',
      '######.####.',
      '.######.....',
      '..#####.....',
      '...####.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
      '......#.....',
    ]
    var glyphs = {
      N: ['10001', '11001', '10101', '10011', '10001'],
      M: ['10001', '11011', '10101', '10001', '10001'],
      R: ['11110', '10001', '11110', '10010', '10001'],
    }
    var G = 'var(--G)', C = 'var(--C)', Y = 'var(--Y)'
    function block(x, y, fill) {
      return '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + fill + '"/>'
    }
    var rects = ''
    for (var r = 0; r < SPROUT.length; r++) {
      for (var c = 0; c < SPROUT[r].length; c++) {
        if (SPROUT[r][c] === '#') rects += block(c, r, G)
      }
    }
    // N / M / R stacked to the right of the sprout, in the header letter colours.
    var XOFF = 13
    var letters = [['N', C, 5], ['M', Y, 11], ['R', G, 17]]
    letters.forEach(function (l) {
      glyphs[l[0]].forEach(function (row, y) {
        row.split('').forEach(function (cell, x) {
          if (cell === '1') rects += block(XOFF + x, l[2] + y, l[1])
        })
      })
    })
    return '<svg class="sprout-logo" viewBox="0 0 18 22" shape-rendering="crispEdges" ' +
      'role="img" aria-label="NMR — No More Robots">' + rects + '</svg>'
  }

  // The left-column graphic: the smiling teletext TV mascot with its GOOD NEWS caption.
  function mascotHTML() {
    return '<div class="ceefax-graphic">' +
      sproutLogoSVG() +
      '<div class="mascot-caption">GOOD NEWS</div>' +
      '</div>'
  }

  // When set, the masthead date shows this fixed publication date instead of
  // today's date (the clock keeps ticking live, as on a real teletext set).
  var fixedDate = null

  function fmtDate(t) {
    return DAYS[t.getDay()] + ' ' + pad(t.getDate()) + ' ' + MONTHS[t.getMonth()]
  }

  function tickClock() {
    var t = new Date()
    var d = document.getElementById('cx-date')
    var c = document.getElementById('cx-clock')
    if (d) d.textContent = fixedDate != null ? fixedDate : fmtDate(t)
    if (c) c.textContent = pad(t.getHours()) + ':' + pad(t.getMinutes()) + '/' + pad(t.getSeconds())
  }

  // Pin the masthead date to a story's publication date. Pass a Date (or a
  // value new Date() accepts); pass null to restore the live date.
  function setDate(when) {
    if (when == null) { fixedDate = null }
    else {
      var t = when instanceof Date ? when : new Date(when)
      fixedDate = isNaN(t.getTime()) ? null : fmtDate(t)
    }
    tickClock()
  }

  // Render the authentic Ceefax masthead into #header:
  //   row 0 — P{n}  CEEFAX NMR {n}  {date}  {clock in yellow}
  //   rows 1-2 — NMR block logo + a big yellow section title on a blue banner
  //   row 3 — white description + the page number in yellow
  // `section` is the big banner title (e.g. a category); `desc` is the row-3 text.
  function renderHeader(page, section, desc) {
    currentPage = String(page)
    document.getElementById('header').innerHTML =
      '<div class="ceefax-mast">' +
        '<span class="m-page" id="cx-pagenum">P' + escapeHTML(page) + '</span>' +
        '<span class="m-service">CEEFAX NMR <span id="cx-svcpage">' + escapeHTML(page) + '</span></span>' +
        '<span class="m-date" id="cx-date"></span>' +
        '<span class="ceefax-clock" id="cx-clock"></span>' +
      '</div>' +
      '<div class="ceefax-banner">' +
        '<a class="ceefax-brand" href="/" aria-label="NMR News — home">' + nmrLogoSVG() + '</a>' +
        '<div class="ceefax-banner-title" id="cx-section">' + escapeHTML(section) + '</div>' +
      '</div>' +
      '<div class="ceefax-subhead">' +
        '<span class="sh-text" id="cx-desc">' + escapeHTML(desc) + '</span>' +
        '<span class="sh-page">' + escapeHTML(page) + '</span>' +
      '</div>'
    tickClock()
    clearInterval(renderHeader._t)
    renderHeader._t = setInterval(tickClock, 1000)
  }

  // Update the row-3 description text (without restarting the clock).
  function setStatus(desc) {
    var el = document.getElementById('cx-desc')
    if (el) el.textContent = desc
  }

  // Update the big yellow section banner title.
  function setSection(section) {
    var el = document.getElementById('cx-section')
    if (el) el.textContent = section
  }

  // Teletext page acquisition: rapidly increment the header page number, as if
  // scanning the broadcast rotation for the requested page, then lock onto
  // `finalPage`. Returns a stop() to call once the page has loaded.
  function scanPage(finalPage) {
    var el = document.getElementById('cx-pagenum')
    var svc = document.getElementById('cx-svcpage')
    if (!el) return function () {}
    var n = 100
    var timer = setInterval(function () {
      n = n >= 899 ? 100 : n + 1
      el.textContent = 'P' + n
      if (svc) svc.textContent = n
    }, 25)
    return function stop() {
      clearInterval(timer)
      el.textContent = 'P' + finalPage
      if (svc) svc.textContent = finalPage
    }
  }

  // Render the FASTEXT bar into #fastext from an array of
  // { color, label, href } in RED / GREEN / YELLOW / CYAN order.
  function renderFastext(links) {
    var host = document.getElementById('fastext')
    if (!host) return
    host.innerHTML = links.map(function (l) {
      return '<a class="fx ' + l.color + '" href="' + escapeHTML(l.href) + '">' +
        '<span class="lbl">' + escapeHTML(l.label) + '</span></a>'
    }).join('')
  }

  // === Teletext navigation: type a 3-digit page number, or press the coloured
  // FASTEXT keys (R/G/Y/C), exactly like a real teletext remote. ===
  var currentPage = ''      // the page number currently displayed (for restore)
  var pageBuffer = ''       // digits typed so far
  var pageBufferTimer = null

  // Map a typed 3-digit page number to a URL. Story-range numbers go to the
  // story page (which redirects to 404 if that page isn't published); anything
  // that isn't a real page tunes to the 404 "off air" page.
  function pageURL(n) {
    if (n === 100) return '/'
    if (n === 199) return '/admin.html'
    if (n === 300) return '/sport.html'
    if (n === 401) return '/weather.html'
    if (n === 402) return '/cities.html'
    if (n >= 101 && n <= 198) return '/story.html?p=' + n
    return '/404.html'
  }

  // Broadcast the digits typed so far so pages can echo them (e.g. the 404
  // page shows them in its "SEARCHING" counter).
  function emitPageEntry() {
    document.dispatchEvent(new CustomEvent('cx-page-entry', { detail: { digits: pageBuffer } }))
  }

  function showTypedPage() {
    var el = document.getElementById('cx-pagenum')
    emitPageEntry()
    // Fill the P-number with the digits typed so far, blanks for the rest.
    if (el) el.textContent = 'P' + (pageBuffer + '   ').slice(0, 3)
  }

  function clearPageBuffer(restore) {
    pageBuffer = ''
    if (pageBufferTimer) { clearTimeout(pageBufferTimer); pageBufferTimer = null }
    if (restore) {
      var el = document.getElementById('cx-pagenum')
      if (el) el.textContent = 'P' + currentPage
    }
    emitPageEntry()
  }

  function typingInField() {
    var el = document.activeElement
    return !!el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)
  }

  function onKeyNav(e) {
    if (typingInField() || e.metaKey || e.ctrlKey || e.altKey) return

    // Coloured FASTEXT keys — red / green / yellow / cyan, like the remote.
    // Click the rendered button so it works whether the bar navigates via a
    // link or runs an onclick action (e.g. the weather day cycle).
    var color = { r: 'red', g: 'green', y: 'yellow', c: 'cyan' }[e.key.toLowerCase()]
    if (color) {
      var btn = document.querySelector('#fastext .fx.' + color)
      if (btn) { e.preventDefault(); btn.click() }
      return
    }

    // Digit entry — accumulate three digits then tune to that page.
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault()
      pageBuffer += e.key
      showTypedPage()
      if (pageBuffer.length === 3) {
        var n = parseInt(pageBuffer, 10)
        clearPageBuffer(false)
        location.assign(pageURL(n))
        return
      }
      // Abandon a half-typed number after a couple of seconds, like a real set.
      if (pageBufferTimer) clearTimeout(pageBufferTimer)
      pageBufferTimer = setTimeout(function () { clearPageBuffer(true) }, 2000)
    }
  }
  document.addEventListener('keydown', onKeyNav)

  // === Scale the fixed 640px "screen" to fill the window width — zoom up on
  // wide screens, down on narrow ones, capped so the text never gets oversized
  // (beyond the cap it stays centred with margins). `zoom` scales layout (unlike
  // transform) so scrolling and the fixed bars still behave. ===
  var MAX_ZOOM = 2.0
  function fitViewport() {
    if (!document.body) return
    // Measure the root element's width — it's the true window width and, unlike
    // window.innerWidth, is unaffected by the zoom we set on <body> (so it never
    // feeds back on itself).
    var w = document.documentElement.clientWidth
    document.body.style.zoom = Math.min(w / 640, MAX_ZOOM)
  }
  window.addEventListener('resize', fitViewport)

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fitViewport)
  } else {
    fitViewport()
  }

  // === CRT power-on gating — only play the switch-on "tune-in" on a genuine
  // load/refresh of the site or a fresh arrival from elsewhere, NOT when
  // clicking a link within the site (those are same-origin navigations). ===
  function shouldPowerOn() {
    var nav = (window.performance && performance.getEntriesByType &&
               performance.getEntriesByType('navigation')[0]) || null
    if (nav && nav.type === 'reload') return true       // refresh (F5)
    try {
      // no referrer, or arrived from a different site → a fresh entry
      return !document.referrer || new URL(document.referrer).origin !== location.origin
    } catch (e) { return true }
  }
  if (shouldPowerOn()) document.documentElement.classList.add('crt-boot')

  // Generic Ceefax-style story graphics (blocky SVGs in /images/graphics).
  var GRAPHICS = [
    { name: 'Games controller', path: '/images/graphics/controller.svg' },
    { name: 'Trophy / award',   path: '/images/graphics/trophy.svg' },
    { name: 'Star',             path: '/images/graphics/star.svg' },
    { name: 'Heart',            path: '/images/graphics/heart.svg' },
    { name: 'Growth arrow',     path: '/images/graphics/growth.svg' },
    { name: 'Leaf / nature',    path: '/images/graphics/leaf.svg' },
    { name: 'Book / education',  path: '/images/graphics/book.svg' },
    { name: 'Building / studio', path: '/images/graphics/building.svg' },
    { name: 'Globe / world',    path: '/images/graphics/globe.svg' },
    { name: 'Person',           path: '/images/graphics/person.svg' },
    { name: 'Computer',         path: '/images/graphics/monitor.svg' },
    { name: 'Money / funding',  path: '/images/graphics/money.svg' },
  ]

  window.CX = {
    db: db,
    GRAPHICS: GRAPHICS,
    escapeHTML: escapeHTML,
    delay: delay,
    cachedJSON: cachedJSON,
    nmrLogoSVG: nmrLogoSVG,
    sproutLogoSVG: sproutLogoSVG,
    mascotHTML: mascotHTML,
    renderHeader: renderHeader,
    setDate: setDate,
    setStatus: setStatus,
    setSection: setSection,
    scanPage: scanPage,
    renderFastext: renderFastext,
  }
})()
