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

  // "NMR" as chunky teletext block letters (SAA5050 sixel-mosaic look).
  // Each glyph is a 5x5 bitmap; a '1' lights that block.
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

  // The left-column graphic: the smiling teletext TV mascot with its GOOD NEWS caption.
  function mascotHTML() {
    return '<div class="ceefax-graphic">' +
      '<img src="/images/ceefax-indie.png" alt="NMR News mascot" class="mascot-img">' +
      '<div class="mascot-caption">GOOD NEWS</div>' +
      '</div>'
  }

  function tickClock() {
    var t = new Date()
    var d = document.getElementById('cx-date')
    var c = document.getElementById('cx-clock')
    if (d) d.textContent = DAYS[t.getDay()] + ' ' + pad(t.getDate()) + ' ' + MONTHS[t.getMonth()]
    if (c) c.textContent = pad(t.getHours()) + ':' + pad(t.getMinutes()) + '/' + pad(t.getSeconds())
  }

  // Render the authentic Ceefax masthead into #header:
  //   row 0 — P{n}  CEEFAX NMR {n}  {date}  {clock in yellow}
  //   rows 1-2 — NMR block logo + a big yellow section title on a blue banner
  //   row 3 — white description + the page number in yellow
  // `section` is the big banner title (e.g. a category); `desc` is the row-3 text.
  function renderHeader(page, section, desc) {
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
    nmrLogoSVG: nmrLogoSVG,
    mascotHTML: mascotHTML,
    renderHeader: renderHeader,
    setStatus: setStatus,
    setSection: setSection,
    scanPage: scanPage,
    renderFastext: renderFastext,
  }
})()
