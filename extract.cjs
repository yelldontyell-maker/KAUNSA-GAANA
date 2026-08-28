const spotifyUrlInfo = require('spotify-url-info');
const fetch = require('isomorphic-unfetch');

const { getTracks } = spotifyUrlInfo(fetch);

const urls = [
  "https://open.spotify.com/playlist/2wcfPBbMqVXM4Q5DXiQ41G",
  "https://open.spotify.com/playlist/0s9gukiqrJ04WkACvoAHvD",
  "https://open.spotify.com/playlist/0ZSRLf8G8ao6hNo1FXFDH0",
  "https://open.spotify.com/playlist/7abQMoXO6taNBFdJ4vHDPn",
  "https://open.spotify.com/playlist/43DZEu30VQvpCV1O4WH4BN",
  "https://open.spotify.com/playlist/37i9dQZF1DX1ct2TQrAvRf",
  "https://open.spotify.com/playlist/4ER1LnDMQCC2Q7JlBUzU1F"
];

async function extract() {
  const allTracks = new Set();
  
  for (const url of urls) {
    try {
      const tracks = await getTracks(url);
      tracks.forEach(t => {
        if (t.name && t.artists && t.artists.length > 0) {
          allTracks.add(`${t.name} ${t.artists[0].name}`);
        }
      });
    } catch (e) {
      console.error("Error on", url, e.message);
    }
  }
  
  console.log(JSON.stringify(Array.from(allTracks), null, 2));
}

extract();
