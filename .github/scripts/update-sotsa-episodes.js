// Fetches the United Society Affiliates YouTube RSS feed and rewrites the
// episode list on state-of-the-streets-address.html between the
// EPISODES:START / EPISODES:END markers, most recent video first.

const fs = require('fs');
const path = require('path');
const https = require('https');

const CHANNEL_ID = 'UCQ1hleU0HmbK2LaXca1Drcg';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const PAGE_PATH = path.join(__dirname, '..', '..', 'state-of-the-streets-address.html');
const START_MARKER = '<!-- EPISODES:START -->';
const END_MARKER = '<!-- EPISODES:END -->';

function fetchFeed(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchFeed(res.headers.location).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Feed request failed with status ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseEntries(xml) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];
    const videoId = (block.match(/<yt:videoId>([^<]*)<\/yt:videoId>/) || [])[1];
    const title = (block.match(/<title>([^<]*)<\/title>/) || [])[1];
    const published = (block.match(/<published>([^<]*)<\/published>/) || [])[1];
    if (!videoId || !title || !published) continue;
    entries.push({
      videoId,
      title: decodeEntities(title.trim()),
      published: new Date(published),
    });
  }
  entries.sort((a, b) => b.published - a.published);
  return entries;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function renderList(entries) {
  return entries
    .map((entry) => {
      const title = escapeHtml(entry.title);
      const date = formatDate(entry.published);
      const thumbUrl = `https://i.ytimg.com/vi/${entry.videoId}/hqdefault.jpg`;
      return [
        '                <li class="sotsa-episode">',
        `                    <a href="https://www.youtube.com/watch?v=${entry.videoId}" target="_blank" rel="noopener noreferrer">`,
        `                        <img class="sotsa-episode-thumb" src="${thumbUrl}" alt="" loading="lazy" width="320" height="180">`,
        '                        <span class="sotsa-episode-text">',
        `                            <span class="sotsa-episode-title">${title}</span>`,
        `                            <span class="sotsa-episode-date">${date}</span>`,
        '                        </span>',
        '                    </a>',
        '                </li>',
      ].join('\n');
    })
    .join('\n');
}

async function main() {
  const xml = await fetchFeed(FEED_URL);
  const entries = parseEntries(xml);
  if (entries.length === 0) {
    throw new Error('No videos found in feed; refusing to overwrite existing list.');
  }

  const html = fs.readFileSync(PAGE_PATH, 'utf8');
  const startIdx = html.indexOf(START_MARKER);
  const endIdx = html.indexOf(END_MARKER);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error('Could not find EPISODES:START / EPISODES:END markers in the page.');
  }

  const before = html.slice(0, startIdx + START_MARKER.length);
  const after = html.slice(endIdx);
  const newHtml = `${before}\n${renderList(entries)}\n                ${after}`;

  if (newHtml === html) {
    console.log('No changes — episode list already up to date.');
    return;
  }

  fs.writeFileSync(PAGE_PATH, newHtml, 'utf8');
  console.log(`Updated episode list with ${entries.length} videos.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
