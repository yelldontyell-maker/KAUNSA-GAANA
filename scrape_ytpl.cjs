const ytpl = require('ytpl');
const fs = require('fs');

(async () => {
    const lists = [
        "PLjxsdvPZH24OZoxZSnuEqrW1crVtceCNG",
        "PLRv0QDUN0WEIcKOCpVtxU98AtJ2mxzXmG",
        "PLu1VwkFUm56jdkb3_AK9KHBOudjDQ3-J9",
        "PLmfcCDSUSykaj8VP1b5M_UKHTf9cKWrNS"
    ];
    let allVideos = [];
    for (const l of lists) {
        console.log("Scraping " + l);
        try {
            const playlist = await ytpl(l, { limit: Infinity });
            console.log("Found " + playlist.items.length);
            for (const item of playlist.items) {
                let artist = item.author ? item.author.name : "Unknown Artist";
                if (artist.endsWith(" - Topic")) {
                    artist = artist.replace(" - Topic", "");
                }
                allVideos.push({
                    name: item.title,
                    artist: artist,
                    videoId: item.id
                });
            }
        } catch (e) {
            console.error("Error with playlist " + l, e.message);
        }
    }
    
    const current = JSON.parse(fs.readFileSync('./src/db_bollywood.json', 'utf8'));
    const before = current.length;
    const existingIds = new Set(current.map(x => x.videoId));
    let added = 0;
    for (const v of allVideos) {
        if (!existingIds.has(v.videoId)) {
            current.push(v);
            existingIds.add(v.videoId);
            added++;
        }
    }
    fs.writeFileSync('./src/db_bollywood.json', JSON.stringify(current, null, 2));
    console.log(`Added ${added} new tracks! Total now ${current.length}`);
})();
