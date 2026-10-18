// Run only after publication rights and depicted-person consent are confirmed.
// No retouching or filters: orientation, responsive resize and metadata removal.
import { mkdir, copyFile, constants } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const sharp = require(process.env.GIRLIE_SHARP_PATH || 'sharp');
const source = process.argv[2];
if (!source) throw new Error('Supply the folder containing the approved original JPGs.');
const originals = path.resolve('.private/girlie-memories/originals');
const output = path.resolve('public/images/girlie-memories');
await mkdir(originals, { recursive: true });
await mkdir(output, { recursive: true });
const files = [...Array.from({ length: 24 }, (_, i) => `${i + 2}.JPG`), '2eee2ed2639846ccb5f50740b3d9d3.JPG'];
for (const file of files) {
  try { await copyFile(path.join(source, file), path.join(originals, file), constants.COPYFILE_EXCL); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
}
const selected = [2, 3, 4, 20, 21, 6, 10, 11, 22, 9, 13, 15, 17, 23, 7, 8, 12, 14, 24];
for (const id of selected) {
  for (const width of [640, 1280]) {
    await sharp(path.join(originals, `${id}.JPG`)).rotate().resize({ width, withoutEnlargement: true })
      .webp({ quality: 86 }).toFile(path.join(output, `memory-${id}-${width}.webp`));
  }
}
console.log(`Backed up ${files.length} originals; prepared ${selected.length} approved photos in two responsive sizes.`);
