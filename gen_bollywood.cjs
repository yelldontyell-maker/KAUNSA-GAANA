const fs = require('fs');
const db = JSON.parse(fs.readFileSync('./src/db_bollywood.json', 'utf8'));
const md = '# Bollywood Track List\n\n' + db.map((s, i) => `${i+1}. **${s.name}** - ${s.artist}`).join('\n');
fs.writeFileSync('C:/Users/ARYAN/.gemini/antigravity-ide/brain/28393ab5-2b3d-43b9-8afc-1c113e99b3cd/bollywood_list.md', md);
console.log("Done");
