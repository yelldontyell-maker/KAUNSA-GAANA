const fs = require('fs');

const dhh = [
  "Brown Munde - AP Dhillon", "Mere Gully Mein - Divine", "Machayenge - Emiway", "Namastute - Seedhe Maut", "Nanchaku - Seedhe Maut",
  "Farak - Divine", "Mirchi - Divine", "Makasam - KR$NA", "No Cap - KR$NA", "Baazigar - Divine",
  "Basti Ka Hasti - MC Stan", "Ek Din Pyaar - MC Stan", "Excuses - AP Dhillon", "Summer High - AP Dhillon", "10 Pe 10 - KR$NA",
  "Khatta Flow - Seedhe Maut", "11K - Seedhe Maut", "Guess - KR$NA", "Company - Emiway", "Aathma Raama - Brodha V",
  "Vyanjan - KR$NA", "Kaam 25 - Divine", "Kohinoor - Divine", "Chal Bombay - Divine", "Punya Paap - Divine",
  "Tadipaar - MC Stan", "Shana Bann - MC Stan", "Khuja Mat - MC Stan", "Samajh Mein Aaya Kya - Emiway", "Giraftaar - Emiway",
  "Khatam - Emiway", "Freeverse Feast - KR$NA", "Say My Name - KR$NA", "I Guess - KR$NA", "Batti - Seedhe Maut",
  "MMM - Seedhe Maut", "Natkhat - Seedhe Maut", "Do Guna - Seedhe Maut", "Kehndi Hundi Si - AP Dhillon", "Insane - AP Dhillon",
  "Desires - AP Dhillon", "Toxic - AP Dhillon", "Spaceship - AP Dhillon", "Majhail - AP Dhillon", "Tere Te - AP Dhillon",
  "Gully Ka Kutta - Divine", "One Side - Divine", "3:59 AM - Divine", "Wallah - Divine", "Satya - Divine",
  "Khatta Flow - KR$NA", "Fall Off - KR$NA", "Dum Pishach - KR$NA", "Prarthana - KR$NA", "Wanna Know - KR$NA",
  "Amin - MC Stan", "Astaghfirullah - MC Stan", "Numb - MC Stan", "Broke Is A Joke - MC Stan", "Insaan - MC Stan",
  "Tribute - Emiway", "Checkmate - Emiway", "Firse Machayenge - Emiway", "Grind - Emiway", "Kots - Emiway",
  "Pankh - Seedhe Maut", "Shaktimaan - Seedhe Maut", "Kyu - Seedhe Maut", "Rajdhani - Seedhe Maut", "Gandi Aulaad - Seedhe Maut",
  "Maina - Seedhe Maut", "Gehraiyaan - Divine", "Punya Paap - Divine", "Too Hype - Divine", "Remand - Divine",
  "Moosedrilla - Divine", "Rider - Divine", "Roots - Divine", "Jungli Kutta - Divine", "Vibe Hai - Divine",
  "Naezy - Aafat", "Naezy - Haq Hai", "Naezy - Asal Hustle", "Naezy - Tehelka", "Prabh Deep - Chitta",
  "Prabh Deep - Class-Sikh", "Prabh Deep - Maya", "Prabh Deep - Paapi", "Prabh Deep - Amar", "Yashraj - Dooba",
  "Yashraj - Galat Karam", "Raftaar - Microhone Check", "Raftaar - Damn", "Raftaar - Sheikh Chilli", "Raftaar - Mantona",
  "Karma - 1 2 3", "Karma - I.C.U", "Karma - Narmahat", "Brodha V - Way Too Easy", "Brodha V - Vainko"
].map(s => {
  const [name, artist] = s.split(' - ');
  return { name: name.trim(), artist: artist.trim() };
});

const bollywood = [
  "Tum Hi Ho - Arijit Singh", "Channa Mereya - Arijit Singh", "Kabira - Tochi Raina", "Gerua - Arijit Singh", "Kar Gayi Chull - Badshah",
  "Kala Chashma - Badshah", "Ghungroo - Arijit Singh", "Senorita - Farhan Akhtar", "Ilahi - Arijit Singh", "Subha Hone Na De - Mika Singh",
  "Balam Pichkari - Vishal Dadlani", "Chaiyya Chaiyya - Sukhwinder Singh", "Desi Girl - Shankar Mahadevan", "Sheila Ki Jawani - Sunidhi Chauhan", "Tujh Mein Rab Dikhta Hai - Roop Kumar Rathod",
  "Mauja Hi Mauja - Mika Singh", "Lungi Dance - Yo Yo Honey Singh", "Dilliwaali Girlfriend - Arijit Singh", "Abhi Mujh Mein Kahin - Sonu Nigam", "Teri Meri - Rahat Fateh Ali Khan",
  "Ae Dil Hai Mushkil - Arijit Singh", "Zaalima - Arijit Singh", "Nashe Si Chadh Gayi - Arijit Singh", "Kal Ho Naa Ho - Sonu Nigam", "Suraj Hua Maddham - Sonu Nigam",
  "Mitwa - Shafqat Amanat Ali", "Tera Ban Jaunga - Akhil Sachdeva", "Bekhayali - Sachet Tandon", "Tujhe Kitna Chahne Lage - Arijit Singh", "Shayad - Arijit Singh",
  "Dil Diyan Gallan - Atif Aslam", "O Sathi - Atif Aslam", "Jeene Laga Hoon - Atif Aslam", "Pehli Nazar Mein - Atif Aslam", "Tera Hone Laga Hoon - Atif Aslam",
  "Bom Diggy Diggy - Zack Knight", "Aankh Marey - Neha Kakkar", "Dilbar - Neha Kakkar", "O Saki Saki - Neha Kakkar", "Garmi - Badshah",
  "Genda Phool - Badshah", "DJ Waley Babu - Badshah", "Abhi Toh Party Shuru Hui Hai - Badshah", "Tareefan - Badshah", "Proper Patola - Badshah",
  "Blue Eyes - Yo Yo Honey Singh", "Desi Kalakaar - Yo Yo Honey Singh", "Love Dose - Yo Yo Honey Singh", "Dope Shope - Yo Yo Honey Singh", "Brown Rang - Yo Yo Honey Singh",
  "Angreji Beat - Yo Yo Honey Singh", "Sunny Sunny - Yo Yo Honey Singh", "High Heels - Yo Yo Honey Singh", "Main Tera Boyfriend - Arijit Singh", "Cheez Badi - Neha Kakkar",
  "Swag Se Swagat - Vishal Dadlani", "Baby Ko Bass Pasand Hai - Vishal Dadlani", "Malhari - Vishal Dadlani", "Bala - Vishal Dadlani", "Tattad Tattad - Aditya Narayan",
  "Chikni Chameli - Shreya Ghoshal", "Radha - Shreya Ghoshal", "Nagada Sang Dhol - Shreya Ghoshal", "Pingaa - Shreya Ghoshal", "Deewani Mastani - Shreya Ghoshal",
  "Param Sundari - Shreya Ghoshal", "Raabta - Arijit Singh", "Phir Le Aya Dil - Arijit Singh", "Mast Magan - Arijit Singh", "Samjhawan - Arijit Singh",
  "Sooraj Dooba Hain - Arijit Singh", "Sanam Re - Arijit Singh", "Agar Tum Saath Ho - Arijit Singh", "Khairiyat - Arijit Singh", "Hawayein - Arijit Singh",
  "Ghar More Pardesiya - Shreya Ghoshal", "Pal Pal Dil Ke Paas - Kishore Kumar", "Lag Jaa Gale - Lata Mangeshkar", "Kajra Re - Alisha Chinai", "Crazy Kiya Re - Sunidhi Chauhan",
  "Kamli - Sunidhi Chauhan", "Beedi - Sunidhi Chauhan", "Ishq Sufiyana - Kamal Khan", "Jugni - Arif Lohar", "London Thumakda - Labh Janjua",
  "Gallan Goodiyaan - Yashita Sharma", "Nachde Ne Saare - Jasleen Royal", "Navrai Majhi - Sunidhi Chauhan", "Zingaat - Ajay-Atul", "Ainvayi Ainvayi - Salim Merchant",
  "Iktara - Kavita Seth", "Kabira Encore - Arijit Singh", "Jashn-E-Bahaara - Javed Ali", "Kun Faya Kun - AR Rahman", "Sadda Haq - Mohit Chauhan",
  "Matargashti - Mohit Chauhan", "Tum Se Hi - Mohit Chauhan", "Pee Loon - Mohit Chauhan", "Illahi - Mohit Chauhan", "Hawa Hawa - Mika Singh"
].map(s => {
  const [name, artist] = s.split(' - ');
  return { name: name.trim(), artist: artist.trim() };
});

fs.writeFileSync('src/raw_dhh.json', JSON.stringify(dhh, null, 2));
fs.writeFileSync('src/raw_bollywood.json', JSON.stringify(bollywood, null, 2));

console.log("Written 100 DHH and 100 Bollywood songs to raw files.");
