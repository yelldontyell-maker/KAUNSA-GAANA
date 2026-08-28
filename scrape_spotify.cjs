const fetch = require('isomorphic-fetch');
const { getTracks } = require('spotify-url-info')(fetch);
const ytSearch = require('youtube-search-api');
const fs = require('fs');
const path = require('path');

const playlists = [
  "https://open.spotify.com/playlist/2wcfPBbMqVXM4Q5DXiQ41G",
  "https://open.spotify.com/playlist/0s9gukiqrJ04WkACvoAHvD",
  "https://open.spotify.com/playlist/0ZSRLf8G8ao6hNo1FXFDH0",
  "https://open.spotify.com/playlist/7abQMoXO6taNBFdJ4vHDPn",
  "https://open.spotify.com/playlist/43DZEu30VQvpCV1O4WH4BN",
  "https://open.spotify.com/playlist/37i9dQZF1DX1ct2TQrAvRf",
  "https://open.spotify.com/playlist/4ER1LnDMQCC2Q7JlBUzU1F"
];

async function main() {
  console.log("Fetching tracks from Spotify playlists...");
  
  const allTracks = [];
  const trackIds = new Set(); // Prevent duplicates

  for (let i = 0; i < playlists.length; i++) {
    const url = playlists[i];
    try {
      const tracks = await getTracks(url);
      console.log(`Playlist ${i+1}: Found ${tracks.length} tracks.`);
      for (const t of tracks) {
        if (!trackIds.has(t.uri)) {
          trackIds.add(t.uri);
          allTracks.push({
            name: t.name,
            artist: t.artist || 'Unknown'
          });
        }
      }
    } catch (e) {
      console.error(`Error scraping playlist ${i+1}:`, e.message);
    }
  }

  console.log(`Total unique tracks to fetch from YouTube: ${allTracks.length}`);

  const outPath = path.join(__dirname, 'src', 'db_spotify.json');
  const finalDb = [];

  for (let i = 0; i < allTracks.length; i++) {
    const song = allTracks[i];
    const query = `${song.name} ${song.artist} official audio`;
    console.log(`[${i+1}/${allTracks.length}] Searching YT: ${song.name} - ${song.artist}`);
    
    try {
      const res = await ytSearch.GetListByKeyword(query, false, 1);
      if (res && res.items && res.items.length > 0) {
        const video = res.items[0];
        finalDb.push({
          name: song.name,
          artist: song.artist,
          videoId: video.id,
          cover: video.thumbnail?.thumbnails?.[0]?.url || ''
        });
        console.log(`  -> Found: ${video.id}`);
      } else {
        console.log(`  -> No results found.`);
      }
    } catch (e) {
      console.error(`  -> Error fetching ${query}:`, e.message);
    }
    
    // 200ms delay to avoid aggressive rate limits
    await new Promise(r => setTimeout(r, 200));
  }

  fs.writeFileSync(outPath, JSON.stringify(finalDb, null, 2));
  console.log(`\nFinished! Wrote ${finalDb.length} Spotify tracks to db_spotify.json`);
}

main().catch(console.error);
