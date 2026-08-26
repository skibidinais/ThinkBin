const sharp = require('sharp');
const path = require('path');

async function processImage() {
  const inputPath = path.join(__dirname, 'public', 'screens_assets', 'shop_bg_market.jpg');
  const outputPath = path.join(__dirname, 'public', 'screens_assets', 'shop_clean_background.jpg');
  
  const W = 768;
  const H = 1024;

  // 1. Sky Patch (covers Y: 0 to 110)
  const skyPatch = await sharp(inputPath)
    .extract({ left: 175, top: 0, width: 200, height: 75 })
    .resize(W, 110, { fit: 'fill' })
    .toBuffer();

  // 2. Awning Patch (covers Y: 105 to 205)
  const awningPatch = await sharp(inputPath)
    .extract({ left: 120, top: 105, width: 280, height: 100 })
    .resize(W, 100, { fit: 'fill' })
    .toBuffer();

  // 3. Ground Sand Path Patch (only covers center bottom where navbar was, X: 40 to 728, Y: 860 to 1024)
  const groundSandPatch = await sharp(inputPath)
    .extract({ left: 180, top: 720, width: 400, height: 140 })
    .resize(W, 165, { fit: 'fill' })
    .toBuffer();

  await sharp(inputPath)
    .composite([
      {
        input: skyPatch,
        top: 0,
        left: 0,
      },
      {
        input: awningPatch,
        top: 105,
        left: 0,
      },
      {
        input: groundSandPatch,
        top: 860,
        left: 0,
      }
    ])
    .jpeg({ quality: 96 })
    .toFile(outputPath);

  console.log('Successfully generated clean background!');
}

processImage().catch(console.error);
