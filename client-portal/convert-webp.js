const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'public', 'img');
const files = fs.readdirSync(imgDir).filter(f => f.endsWith('.jpg'));

(async () => {
  for (const file of files) {
    const input = path.join(imgDir, file);
    const output = path.join(imgDir, file.replace('.jpg', '.webp'));
    const stat = fs.statSync(input);
    console.log(`Converting ${file} (${(stat.size/1024/1024).toFixed(2)} MB)...`);
    
    const img = sharp(input);
    const meta = await img.metadata();
    console.log(`  Resolution: ${meta.width}x${meta.height}`);
    
    await img.webp({ quality: 75 }).toFile(output);
    const outStat = fs.statSync(output);
    console.log(`  -> ${file.replace('.jpg', '.webp')} (${(outStat.size/1024/1024).toFixed(2)} MB, ${Math.round((1-outStat.size/stat.size)*100)}% kleiner)`);
  }
  console.log('Fertig.');
})();
