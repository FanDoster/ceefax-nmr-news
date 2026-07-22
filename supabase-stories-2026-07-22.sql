-- Four new good-news stories, scanned 22 Jul 2026.
-- Run this in the Supabase SQL Editor for the ceefax-news project:
--   https://supabase.com/dashboard/project/exmksuzyfbhfybzoxfsg/sql/new
--
-- Sources:
--   P127 https://www.techtimes.com/articles/320294/20260713/league-legends-classic-launches-july-29-season-3-kits-60-champions.htm
--   P128 https://www.greenmangaming.com/blog/palworld-1-0-release-date-new-features-gameplay-trailer-and-more/
--   P129 https://www.gamesaid.org/news-stories/gamesaid-charities-announced-for-2026-2027/
--   P130 https://www.pcgamer.com/games/fallout/bethesda-confirms-fallout-3-and-new-vegas-remasters-makes-obsidian-collaboration-official-and-says-fallout-5-is-in-pre-production/

INSERT INTO ceefax_stories (page_number, title, category, image_url, body) VALUES
(
  127,
  'League Of Legends Turns Back The Clock',
  'CULTURE',
  '/images/graphics/monitor.svg',
  'Riot Games is winding back the clock: League of Legends Classic launches on 29 July, rebuilding the Summoner''s Rift of the Season 3 era inside the modern client.

Sixty champions return with their original pre-rework kits, along with old-school runes, masteries and items. The mode was unveiled during the MSI Finals broadcast, and a nostalgic TSM versus CLG exhibition match on 24 July warms up the launch.

Live games rarely let you visit their past — Classic turns a decade of patches into a time machine, with no second download required.'
),
(
  128,
  'Palworld Leaves Early Access At Last',
  'INDIE',
  '/images/graphics/star.svg',
  'Palworld has left early access at last, with version 1.0 arriving on 10 July as a free update for everyone who already owns it — plus a day-one spot on Game Pass.

Pocketpair''s monster-catching survival hit spent two and a half years in early access after shipping 15 million copies in its first month and briefly becoming the second most-played game in Steam history. The full release adds more than 70 new Pals and fresh corners of the map to explore.

Few games have travelled from chaotic sensation to finished article so publicly — a win for the players who stuck around.'
),
(
  129,
  'GamesAid Names Its Five Good Causes',
  'CHARITY',
  '/images/graphics/heart.svg',
  'GamesAid, the UK games industry''s own charity, has named the five causes it will support for 2026/27, chosen by a ballot of its members.

Action for Kids and Solving Kids Cancer return from last year, Game Therapy UK is back for another spell, and Apart of Me and Spectrum Gaming join for the first time. Each receives in-kind support through the year and a cash donation at its end.

From bereavement support to autism-friendly gaming communities, it is the industry quietly looking after the players who need it most.'
),
(
  130,
  'Two Classic Fallouts Getting Remasters',
  'NEWS',
  '/images/graphics/controller.svg',
  'Bethesda has confirmed that remasters of Fallout 3 and Fallout: New Vegas are on the way, following the treatment that brought Oblivion back to life last year.

The 17 July roadmap also made the long-rumoured official: Obsidian, the studio behind New Vegas, is working on a brand new Fallout game, while Fallout 5 has entered pre-production at Bethesda itself.

No dates yet, but for fans of the wasteland the message is clear — war never changes, and neither does the appetite for more Fallout.'
)
ON CONFLICT (page_number) DO NOTHING;
