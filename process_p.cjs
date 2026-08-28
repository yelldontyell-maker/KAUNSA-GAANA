const fs = require('fs');

const current = JSON.parse(fs.readFileSync('./src/db_bollywood.json', 'utf8'));
const existingIds = new Set(current.map(x => x.videoId));
let added = 0;

for (let i = 1; i <= 4; i++) {
    try {
        const data = fs.readFileSync(`p${i}.json`, 'utf16le');
        const lines = data.split('\n').filter(l => l.trim() !== '');
        for (const line of lines) {
            try {
                if (!line.trim().startsWith('{')) continue;
                const item = JSON.parse(line);
                if (!item.id || !item.title) continue;
                
                if (!existingIds.has(item.id)) {
                    let artist = item.uploader || item.channel || "Unknown Artist";
                    if (artist.endsWith(" - Topic")) {
                        artist = artist.replace(" - Topic", "");
                    }
                    current.push({
                        name: item.title,
                        artist: artist,
                        videoId: item.id
                    });
                    existingIds.add(item.id);
                    added++;
                }
            } catch (e) {
                // Ignore parse errors on individual lines
            }
        }
    } catch (e) {
        console.error(`Could not read p${i}.json`);
    }
}

fs.writeFileSync('./src/db_bollywood.json', JSON.stringify(current, null, 2));
console.log(`Added ${added} new tracks! Total now ${current.length}`);
