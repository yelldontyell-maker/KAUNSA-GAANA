const fs = require('fs');
const youtubesearchapi = require('youtube-search-api');

const tracks = JSON.parse(fs.readFileSync('desi_hiphop_tracks.json', 'utf8'));

async function searchYouTube(trackName) {
  try {
    const res = await youtubesearchapi.GetListByKeyword(`${trackName} official audio`, false, 1, [{type: 'video'}]);
    if (res.items && res.items.length > 0) {
      const item = res.items[0];
      // Cover is thumbnail
      const cover = item.thumbnail.thumbnails.length > 0 
        ? item.thumbnail.thumbnails[item.thumbnail.thumbnails.length - 1].url 
        : '';
        
      return {
        name: trackName,
        artist: item.channelTitle || '',
        videoId: item.id,
        cover: cover
      };
    }
  } catch (err) {
    console.error("Failed for", trackName, err);
  }
  return null;
}

async function run() {
  const db = [];
  let count = 0;
  for (const track of tracks) {
    const data = await searchYouTube(track);
    if (data) {
      db.push(data);
    }
    count++;
    process.stdout.write(`Processed ${count}/${tracks.length} | Found: ${db.length}\r`);
    // Sleep to avoid rate limits
    await new Promise(r => setTimeout(r, 500));
  }
  fs.writeFileSync('src/desi_hiphop_yt_db.json', JSON.stringify(db, null, 2));
  console.log('\nSaved to src/desi_hiphop_yt_db.json');
}

run();
