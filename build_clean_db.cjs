const ytSearch = require('youtube-search-api');
const fs = require('fs');
const path = require('path');

async function buildDb(rawFile, outFile) {
  console.log(`Building ${outFile} from ${rawFile}...`);
  const rawPath = path.join(__dirname, 'src', rawFile);
  const outPath = path.join(__dirname, 'src', outFile);
  
  const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
  const finalDb = [];

  for (let i = 0; i < rawData.length; i++) {
    const song = rawData[i];
    const query = `${song.name} ${song.artist} official audio`;
    console.log(`[${i+1}/${rawData.length}] Searching: ${query}`);
    
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
    
    // Tiny delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }

  fs.writeFileSync(outPath, JSON.stringify(finalDb, null, 2));
  console.log(`Finished ${outFile}. Wrote ${finalDb.length} songs.\n`);
}

async function main() {
  await buildDb('raw_dhh.json', 'db_dhh.json');
  await buildDb('raw_bollywood.json', 'db_bollywood.json');
}

main().catch(console.error);
