#!/usr/bin/env python3
"""Build the sport-page data blob (served at /data/sport.json).

This runs as a LOCAL cron job on the server — deliberately no GitHub
Actions in the loop. Install (root crontab):

  */30 * * * * cd /root/projects/ceefax-nmr-news && git pull -q --ff-only; /usr/bin/python3 jobs/update_sport.py

The host nginx serves the output file directly at /data/sport.json
(everything else proxies to the ceefax-news container), so sport data
refreshes without an image rebuild.

Sources (both free, no API key):
  - BBC Sport football headlines (RSS)
  - TheSportsDB free tier: Premier League table / fixtures / results

Sections fail independently — a dead feed drops its section rather than
killing the update, and if EVERY section fails the previous file is kept.

Usage: update_sport.py [output-path]   (default /var/www/ceefax-data/sport.json)
"""
import json
import os
import sys
import tempfile
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

OUT = sys.argv[1] if len(sys.argv) > 1 else '/var/www/ceefax-data/sport.json'
EPL = '4328'  # TheSportsDB league id: English Premier League
API = 'https://www.thesportsdb.com/api/v1/json/123'


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'ceefax-news-sport-job/1.0'})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read()


def headlines():
    root = ET.fromstring(get('https://feeds.bbci.co.uk/sport/football/rss.xml'))
    out = []
    for item in root.findall('.//item')[:8]:
        title = (item.findtext('title') or '').strip()
        if title:
            out.append(title)
    return out or None


def seasons_to_try():
    # The football season rolls over in summer: from July, prefer the season
    # that is about to start / just started, else fall back to the last one.
    now = datetime.now(timezone.utc)
    y = now.year if now.month >= 7 else now.year - 1
    return ['%d-%d' % (y, y + 1), '%d-%d' % (y - 1, y)]


def table():
    for season in seasons_to_try():
        rows = json.loads(get(API + '/lookuptable.php?l=' + EPL + '&s=' + season)).get('table') or []
        # A pre-season table (nobody has played) is a placeholder — skip to
        # the previous season's final standings instead.
        if rows and not any(int(r.get('intPlayed') or 0) for r in rows):
            continue
        if rows:
            return {
                'season': season,
                'rows': [{
                    'rank': int(r['intRank']),
                    'team': r['strTeam'],
                    'played': int(r.get('intPlayed') or 0),
                    'points': int(r['intPoints']),
                } for r in rows[:5]],   # free tier caps at 5 — a teletext "top of the table"
            }
    return None


def fixtures():
    evs = json.loads(get(API + '/eventsnextleague.php?id=' + EPL)).get('events') or []
    return [{
        'date': e.get('dateEvent') or '',
        'time': (e.get('strTime') or '')[:5],
        'home': e.get('strHomeTeam') or '',
        'away': e.get('strAwayTeam') or '',
    } for e in evs[:6]] or None


def results():
    evs = json.loads(get(API + '/eventspastleague.php?id=' + EPL)).get('events') or []
    out = []
    for e in evs[:6]:
        if e.get('intHomeScore') is None:
            continue
        out.append({
            'date': e.get('dateEvent') or '',
            'home': e.get('strHomeTeam') or '',
            'hs': int(e['intHomeScore']),
            'as': int(e['intAwayScore']),
            'away': e.get('strAwayTeam') or '',
        })
    return out or None


def main():
    data = {'updated': datetime.now(timezone.utc).isoformat(timespec='seconds')}
    for key, fn in (('headlines', headlines), ('table', table),
                    ('fixtures', fixtures), ('results', results)):
        try:
            val = fn()
        except Exception as e:
            print('warn: %s failed: %s' % (key, e), file=sys.stderr)
            val = None
        if val:
            data[key] = val

    if len(data) == 1 and os.path.exists(OUT):
        print('warn: every feed failed — keeping the previous file', file=sys.stderr)
        return

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(OUT), suffix='.tmp')
    with os.fdopen(fd, 'w') as f:
        json.dump(data, f, separators=(',', ':'))
    os.chmod(tmp, 0o644)
    os.replace(tmp, OUT)   # atomic — nginx never serves a half-written file
    print('wrote %s (%s)' % (OUT, ', '.join(k for k in data if k != 'updated')))


if __name__ == '__main__':
    main()
