import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

await fs.mkdir('docs/media', { recursive: true });
const showcase = 'deliverables/linkedin/BR-Burger-LinkedIn-30s.mp4';
for (const [name, start, duration] of [['scroll-story', 0, 7], ['interactive-menu', 16, 7]]) {
  execFileSync(ffmpeg, ['-y', '-ss', String(start), '-t', String(duration), '-i', showcase,
    '-filter_complex', '[0:v]fps=10,scale=360:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=3',
    '-loop', '0', `docs/media/${name}.gif`], { stdio: 'pipe' });
}
await sharp('test-results/desktop-hero.png').resize({ width: 1440, withoutEnlargement: true }).webp({ quality: 86 }).toFile('docs/media/desktop.webp');
await sharp('test-results/menu-3d.png').resize({ width: 1440, withoutEnlargement: true }).webp({ quality: 86 }).toFile('docs/media/menu.webp');
console.log('README GIFs and screenshots generated.');
