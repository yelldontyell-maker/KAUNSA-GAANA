const fs = require('fs');
const dhh = JSON.parse(fs.readFileSync('src/db_dhh.json'));
const bolly = JSON.parse(fs.readFileSync('src/db_bollywood.json'));

let out = '# Desi Hip Hop Tracks (100)\n\n';
dhh.forEach((t, i) => out += `${i+1}. **${t.name}** - ${t.artist}\n`);

out += '\n# Bollywood Tracks (99)\n\n';
bolly.forEach((t, i) => out += `${i+1}. **${t.name}** - ${t.artist}\n`);

fs.writeFileSync('C:\\Users\\ARYAN\\.gemini\\antigravity-ide\\brain\\28393ab5-2b3d-43b9-8afc-1c113e99b3cd\\song_list.md', out);
