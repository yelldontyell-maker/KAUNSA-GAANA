const fs = require('fs');
const https = require('https');

const tracks = JSON.parse(fs.readFileSync('desi_hiphop_tracks.json', 'utf8'));

function searchITunes(term) {
  return new Promise((resolve) => {
    https.get(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=1&country=IN`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0) {
            const t = json.results[0];
            resolve({
              name: t.trackName,
              artist: t.artistName,
              previewUrl: t.previewUrl,
              cover: t.artworkUrl100
            });
          } else {
            resolve(null);
          }
        } catch(e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  const db = [];
  let count = 0;
  for (const track of tracks) {
    const res = await searchITunes(track);
    if (res && res.previewUrl) {
      db.push(res);
    }
    count++;
    process.stdout.write(`Processed ${count}/${tracks.length} | Found: ${db.length}\r`);
    // sleep slightly to avoid rate limits
    await new Promise(r => setTimeout(r, 100));
  }
  
  fs.writeFileSync('src/desi_hiphop_db.json', JSON.stringify(db, null, 2));
  console.log('\nSaved to src/desi_hiphop_db.json');
}

run();
