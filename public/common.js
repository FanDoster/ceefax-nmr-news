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

  // The left-column graphic: the big NMR block logo with its GOOD NEWS caption.
  function mascotHTML() {
    return '<div class="ceefax-graphic">' +
      nmrLogoSVG() +
      '<div class="mascot-caption">GOOD NEWS</div>' +
      '</div>'
  }

  function tickClock() {
    var el = document.getElementById('cx-clock')
    if (!el) return
    var t = new Date()
    el.textContent = DAYS[t.getDay()] + ' ' + pad(t.getDate()) + ' ' + MONTHS[t.getMonth()] +
      ' ' + pad(t.getHours()) + ':' + pad(t.getMinutes()) + '/' + pad(t.getSeconds())
  }

  // Render the masthead (NMR logo + page number + live clock) and status bar
  // into #header, and start the ticking clock.
  function renderHeader(page, sub) {
    document.getElementById('header').innerHTML =
      '<div class="ceefax-header">' +
        '<a class="ceefax-brand" href="/" aria-label="NMR News — home">' + nmrLogoSVG() + '</a>' +
        '<div class="ceefax-pagenum">P' + escapeHTML(page) + '</div>' +
        '<div class="ceefax-clock" id="cx-clock"></div>' +
      '</div>' +
      '<div class="ceefax-status" id="cx-status">' + escapeHTML(sub) + '</div>'
    tickClock()
    clearInterval(renderHeader._t)
    renderHeader._t = setInterval(tickClock, 1000)
  }

  // Update just the cyan status bar text (without restarting the clock).
  function setStatus(sub) {
    var el = document.getElementById('cx-status')
    if (el) el.textContent = sub
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

  window.CX = {
    db: db,
    escapeHTML: escapeHTML,
    delay: delay,
    nmrLogoSVG: nmrLogoSVG,
    mascotHTML: mascotHTML,
    renderHeader: renderHeader,
    setStatus: setStatus,
    renderFastext: renderFastext,
  }
})()
