const { execSync } = require('child_process');
console.log("Running 90s...");
execSync("node get_spotify.cjs", { stdio: 'inherit' });
console.log("Running Sad...");
execSync("node get_spotify_sad.cjs", { stdio: 'inherit' });
console.log("Running Bollywood...");
execSync("node get_spotify_bollywood.cjs", { stdio: 'inherit' });
console.log("All done!");
