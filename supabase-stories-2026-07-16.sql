-- Four new good-news stories, scanned 16 Jul 2026.
-- Run this in the Supabase SQL Editor for the ceefax-news project:
--   https://supabase.com/dashboard/project/exmksuzyfbhfybzoxfsg/sql/new
-- (Writes are RLS-protected, so they must go in via the SQL editor or the
--  P199 admin page — the public anon key is read-only by design.)
--
-- Sources:
--   P119 https://caniplaythat.com/ (13 Jul + 2 Jul 2026 roundup)
--   P120 https://www.gamesradar.com/games/co-op/viral-indie-hit-meccha-chameleon-sells-a-massive-15-million-copies-in-less-than-a-month-becomes-the-fastest-and-best-selling-game-of-the-year/
--   P121 https://ukie.org.uk/news/for-one-night-only-new-major-showcase-event-celebrating-uk-games-announced
--   P122 https://www.shacknews.com/article/149991/summer-games-done-quick-2026-keeps-things-steady-with-24m-raised-for-doctors-without-borders

INSERT INTO ceefax_stories (page_number, title, category, image_url, body) VALUES
(
  119,
  'Minecraft Bedrock Gets Closed Captions',
  'CULTURE',
  '/images/graphics/controller.svg',
  'Mojang has added closed captions to Minecraft Bedrock Edition, bringing the subtitling long enjoyed in the Java version to players on consoles and mobile.

The update lands amid a wider push on accessibility: Electronic Arts has begun rolling out Accessible Games Initiative tags on its website, giving players clear information about the features each game supports.

Small changes like captions and clear labelling open the world''s biggest games to more players — good news for anyone who plays with the sound down or needs a little extra help.'
),
(
  120,
  'Two-Person Indie Hits 15 Million Sales',
  'INDIE',
  '/images/graphics/star.svg',
  'Meccha Chameleon, a hide-and-seek game made by just two developers, has sold more than 15 million copies on Steam less than a month after its 9 June launch.

Hiders paint their plain white characters to blend into the scenery while Seekers hunt them down — a simple idea that spread through word of mouth and viral clips with barely any marketing. At $4.79, it has become the fastest-selling game of 2026.

Creator lemorion_1224 and programmer Haganeiro met in the Fortnite custom map community, proof that tiny teams with playful ideas can still conquer the charts.'
),
(
  121,
  'Biggest Ever UK Games Showcase In July',
  'NEWS',
  '/images/graphics/monitor.svg',
  'Ukie and Liquid Crimson have announced For One Night Only, billed as the biggest showcase of UK games ever staged, streaming worldwide on Twitch on 29 July.

Filmed at Outernet London in front of a VIP audience, the show promises reveals and interviews from studios including IO Interactive and Criterion, with comedian Bec Hill hosting and a Steam sale of more than 100 British-made titles running alongside.

After a record 2025 for UK games, the nation''s developers are getting a night in the spotlight all of their own.'
),
(
  122,
  'Speedrunners Raise $2.4M For Charity',
  'CULTURE',
  '/images/graphics/heart.svg',
  'Summer Games Done Quick 2026 wrapped up in Minneapolis with $2,408,901 raised for Doctors Without Borders after seven days of non-stop speedrunning from 5 to 11 July.

Volunteers raced through games old and new in front of a global Twitch audience, with donations flowing in for run incentives, prize draws and the simple joy of watching a classic beaten in minutes.

The Games Done Quick marathons have raised tens of millions for good causes since 2010 — proof that playing fast can do slow, lasting good.'
)
ON CONFLICT (page_number) DO NOTHING;
