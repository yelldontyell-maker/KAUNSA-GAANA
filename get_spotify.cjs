const spotify = require('spotify-url-info')(fetch);
const { execSync } = require('child_process');
const fs = require('fs');

async function processPlaylists(urls, outputFile) {
  let allTracks = [];
  
  for (let url of urls) {
    console.log("Fetching playlist: " + url);
    try {
      const data = await spotify.getTracks(url);
      allTracks.push(...data.map(t => ({
        name: t.name,
        artist: t.artist || 'Unknown Artist',
        duration_ms: t.duration
      })));
    } catch (e) {
      console.log("Error fetching " + url, e.message);
    }
  }
  
  console.log(`Found ${allTracks.length} tracks. Removing duplicates...`);
  // Remove duplicates based on name+artist, keeping the first occurrence
  const uniqueMap = new Map();
  for (const t of allTracks) {
    const key = t.name + '::' + t.artist;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, t);
    }
  }
  const unique = Array.from(uniqueMap.values());
  console.log(`Unique tracks: ${unique.length}`);
  
  const results = [];
  for (let i = 0; i < unique.length; i++) {
    const t = unique[i];
    const query = `${t.name} ${t.artist} audio`;
    const targetDuration = t.duration_ms / 1000;
    console.log(`[${i+1}/${unique.length}] Searching YT for: ${query}`);
    
    try {
      // Get top 5 results
      let stdout = '';
      try {
        stdout = execSync(`yt-dlp "ytsearch5:${query}" --dump-json`, { stdio: 'pipe' }).toString();
      } catch (err) {
        if (err.stdout) stdout = err.stdout.toString();
      }
      
      const lines = stdout.trim().split('\n').filter(Boolean);
      
      let bestVideo = null;
      let bestScore = Infinity;
      
      for (const line of lines) {
        try {
          const v = JSON.parse(line);
          // Score = difference in duration (seconds)
          let score = Math.abs(v.duration - targetDuration);
          const title = (v.title || '').toLowerCase();
          
          // Penalties
          if (title.includes('live')) score += 300;
          if (title.includes('cover')) score += 300;
          if (title.includes('karaoke')) score += 300;
          
          if (score < bestScore) {
            bestScore = score;
            bestVideo = v;
          }
        } catch(err) {
          // Ignore invalid JSON lines from yt-dlp stderr
        }
      }
      
      if (bestVideo) {
        results.push({
          name: t.name,
          artist: t.artist,
          type: 'youtube',
          videoId: bestVideo.id,
          cover: `https://i.ytimg.com/vi/${bestVideo.id}/hqdefault.jpg`
        });
      } else {
        console.log("No videos found for: " + t.name);
      }
    } catch (e) {
      console.log("Failed to find YT video for: " + t.name);
    }
  }
  
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log("Done! Wrote " + results.length + " to " + outputFile);
}

// 90s Playlists
const urls_90s = [
  'https://open.spotify.com/playlist/37i9dQZF1EQn2GRFTFMl2A',
  'https://open.spotify.com/playlist/37i9dQZF1DWZNJXX2UeBij',
  'https://open.spotify.com/playlist/37i9dQZF1DXdcRZAcc2QFU',
  'https://open.spotify.com/playlist/37i9dQZF1DXa2huSXaKVkW',
  'https://open.spotify.com/playlist/2xAdkL2ah58m26BlN1SsiY'
];
processPlaylists(urls_90s, 'src/db_90s.json');
