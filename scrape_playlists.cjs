const fs = require('fs');

async function scrapePlaylist(playlistId) {
    const url = `https://www.youtube.com/playlist?list=${playlistId}`;
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    const html = await res.text();
    const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/);
    if (!match) {
        console.log("Could not find ytInitialData for " + playlistId);
        return [];
    }
    const data = JSON.parse(match[1]);
    try {
        const tabs = data.contents.twoColumnBrowseResultsRenderer.tabs;
        const playlistTab = tabs[0].tabRenderer.content;
        const items = playlistTab.sectionListRenderer.contents[0].itemSectionRenderer.contents[0].playlistVideoListRenderer.contents;
        
        const videos = [];
        for (const item of items) {
            if (item.playlistVideoRenderer) {
                const vid = item.playlistVideoRenderer;
                const title = vid.title.runs ? vid.title.runs[0].text : "Unknown Title";
                let artist = "Unknown Artist";
                if (vid.shortBylineText && vid.shortBylineText.runs) {
                    artist = vid.shortBylineText.runs.map(r => r.text).join('');
                }
                videos.push({
                    name: title,
                    artist: artist,
                    videoId: vid.videoId
                });
            }
        }
        return videos;
    } catch(e) {
        console.error("Error parsing playlist " + playlistId, e.message);
        return [];
    }
}

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
        const vids = await scrapePlaylist(l);
        console.log("Found " + vids.length);
        allVideos.push(...vids);
    }
    
    const current = JSON.parse(fs.readFileSync('./src/db_bollywood.json', 'utf8'));
    const before = current.length;
    const existingIds = new Set(current.map(x => x.videoId));
    for (const v of allVideos) {
        if (!existingIds.has(v.videoId)) {
            current.push(v);
            existingIds.add(v.videoId);
        }
    }
    fs.writeFileSync('./src/db_bollywood.json', JSON.stringify(current, null, 2));
    console.log(`Added ${current.length - before} new tracks! Total now ${current.length}`);
})();
