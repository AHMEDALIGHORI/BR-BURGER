import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { chromium } from '@playwright/test';
import ffmpeg from 'ffmpeg-static';

const out = path.resolve('deliverables/linkedin');
const base = process.env.BASE_URL || 'http://localhost:3000';
await fs.mkdir(out, { recursive: true });
const scenes = [
  { start: 0, end: 7, chapter: 0, from: .0, to: .87, title: 'A burger website.<br><em>With movie energy.</em>', label: '01 / SCROLL-CONTROLLED ASSEMBLY' },
  { start: 7, end: 10, chapter: 1, from: .12, to: .84, title: 'From burger<br><em>to crunch.</em>', label: '02 / SEVEN CONNECTED CHAPTERS' },
  { start: 10, end: 13, chapter: 2, from: .10, to: .84, title: 'Ice cold.<br><em>Perfectly crispy.</em>', label: '03 / CINEMATIC FOOD + LIVING TYPE' },
  { start: 13, end: 16, chapter: 3, from: .12, to: .84, title: 'Every detail.<br><em>Wrapped with love.</em>', label: '04 / THE PACKAGING REVEAL' },
  { start: 16, end: 23, chapter: 4, from: .02, to: .86, title: 'A menu you can<br><em>move through.</em>', label: '05 / ROTATING 3D COLLECTION' },
  { start: 23, end: 26, chapter: 5, from: .10, to: .82, title: 'Fresh ingredients.<br><em>Full of motion.</em>', label: '06 / INGREDIENTS IN THE SPOTLIGHT' },
  { start: 26, end: 30, chapter: 6, from: .03, to: .99, title: 'BR–BURGER.<br><em>Every bite matters.</em>', label: '07 / A CONCEPT BUILT FOR THE SCROLL' },
];
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Clash;src:url('${base}/fonts/ClashDisplay-600.woff2')}@font-face{font-family:Satoshi;src:url('${base}/fonts/Satoshi-500.woff2')}
*{box-sizing:border-box}html,body{margin:0;width:1080px;height:1920px;overflow:hidden;background:#f8f6f2;color:#1b1b1b;font-family:Satoshi,Arial}
body:before{content:'';position:absolute;width:900px;height:900px;border:1px solid #d9b87e50;border-radius:50%;top:570px;left:450px}
.brand{position:absolute;left:92px;top:68px;font:600 28px Clash;letter-spacing:-1px}.brand span{color:#ff8a00}.edition{position:absolute;right:94px;top:74px;font-size:16px;letter-spacing:3px;color:#766c5d}
.title{position:absolute;top:132px;left:92px;margin:0;font:600 64px/.98 Clash;letter-spacing:-2.7px;z-index:5}.title em{font-style:normal;color:#dd7100}
.frame{position:absolute;top:320px;left:90px;width:900px;height:1332px;border-radius:32px;overflow:hidden;box-shadow:0 24px 70px -28px #5c40334d;border:1px solid #cfc3b273;background:#f8f6f2;transform-origin:center}
iframe{width:500px;height:740px;border:0;transform:scale(1.8);transform-origin:0 0;display:block;pointer-events:none}
.label{position:absolute;left:92px;top:1695px;font-size:17px;letter-spacing:2.1px;color:#5c4033}.stack{position:absolute;left:92px;top:1740px;font-size:24px;letter-spacing:.4px}.note{position:absolute;right:92px;top:1745px;font-size:15px;color:#766c5d}
.track{position:absolute;left:92px;right:92px;top:1810px;height:3px;background:#ddcfb9}.track span{height:100%;display:block;background:#ff8a00;width:0}
</style></head><body><div class="brand">BR<span>–</span>Burger</div><div class="edition">WEB EXPERIENCE / 2026</div><h1 class="title"></h1><div class="frame"><iframe src="${base}/" title="BR-Burger website"></iframe></div><div class="label"></div><div class="stack">Next.js · GSAP · Three.js</div><div class="note">AI-assisted concept</div><div class="track"><span></span></div><script>window.setScene=(title,label,progress,fade)=>{const h=document.querySelector('.title');if(h.innerHTML!==title)h.innerHTML=title;document.querySelector('.label').textContent=label;h.style.opacity=fade;document.querySelector('.frame').style.opacity=.76+.24*fade;document.querySelector('.track span').style.width=progress*100+'%';};</script></body></html>`;

const browser = await chromium.launch({ headless: true, channel: 'chromium', args: ['--hide-scrollbars'] });
let encoder;
try {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.route('**/__linkedin-showcase', route => route.fulfill({ contentType: 'text/html', body: html }));
  await page.goto(`${base}/__linkedin-showcase`, { waitUntil: 'networkidle' });
  const app = page.frames().find(frame => frame !== page.mainFrame());
  await app.locator('.preloader').waitFor({ state: 'detached' });
  await page.evaluate(() => document.fonts.ready);
  await app.addStyleTag({ content: '::-webkit-scrollbar{display:none}html{scrollbar-width:none}.custom-cursor,.rail-tooltip{display:none!important}.collection-card{cursor:default}' });
  await app.evaluate(async () => {
    await Promise.all([...document.querySelectorAll('video')].map(video => new Promise(resolve => {
      video.addEventListener('loadeddata', resolve, { once: true });
      video.src = video.dataset.mobileSrc;
      video.preload = 'auto';
      video.load();
      setTimeout(resolve, 15000);
    })));
  });
  // Warm every chapter's lazy typography and cached frames before recording.
  for (let index = 0; index < 7; index++) {
    await app.getByRole('button', { name: new RegExp(`^Chapter ${index + 1}:`) }).click();
    await page.waitForTimeout(1500);
  }
  await app.getByRole('button', { name: 'BR-Burger home', exact: true }).click();
  await page.waitForTimeout(1600);
  const positions = await app.evaluate(() => ({
    starts: [...document.querySelectorAll('.chapter')].map(el => el.getBoundingClientRect().top + scrollY),
    end: document.documentElement.scrollHeight - innerHeight,
  }));

  const silent = path.join(out, 'showcase-picture.mp4');
  encoder = spawn(ffmpeg, ['-y','-f','image2pipe','-framerate','30','-vcodec','mjpeg','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart', silent], { stdio: ['pipe','ignore','pipe'] });
  let encoderError = '';
  encoder.stderr.on('data', chunk => { encoderError = (encoderError + chunk.toString()).slice(-5000); });
  const finished = new Promise((resolve,reject) => { encoder.on('error',reject); encoder.on('exit',code=>code===0?resolve():reject(Error(encoderError))); });
  for (let frame = 0; frame < 900; frame++) {
    const t = frame / 30;
    const scene = scenes.find(scene => t >= scene.start && t < scene.end);
    const u = (t - scene.start) / (scene.end - scene.start);
    const p = scene.from + (scene.to - scene.from) * u;
    const start = positions.starts[scene.chapter];
    const end = positions.starts[scene.chapter + 1] ?? positions.end;
    const y = start + (end - start) * p;
    await app.evaluate(async ({ y, index }) => {
      scrollTo(0, y);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const video = document.querySelectorAll('video')[index];
      const start = performance.now();
      while (video.seeking && performance.now() - start < 350) await new Promise(resolve => setTimeout(resolve, 8));
    }, { y, index: scene.chapter });
    const fade = Math.min(1, (t-scene.start)/.16, (scene.end-t)/.16);
    await page.evaluate(({ title, label, progress, fade }) => window.setScene(title, label, progress, fade), { title: scene.title, label: scene.label, progress: frame / 899, fade: scene.start === 0 && t < .16 ? 1 : fade });
    const picture = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!encoder.stdin.write(picture)) await once(encoder.stdin, 'drain');
    if ([45,240,540,855].includes(frame)) await fs.writeFile(path.join(out, `preview-${frame}.jpg`), picture);
    if (frame % 150 === 0) console.log(`Rendered ${frame}/900 frames`);
  }
  encoder.stdin.end();
  await finished;
  console.log('30-second picture sequence rendered.');
} finally { await browser.close(); }

// An original, quiet electronic sound bed. No sampled or third-party music.
const rate = 48000, count = rate * 30;
const wave = Buffer.alloc(44 + count * 4);
wave.write('RIFF',0);wave.writeUInt32LE(wave.length-8,4);wave.write('WAVEfmt ',8);wave.writeUInt32LE(16,16);wave.writeUInt16LE(1,20);wave.writeUInt16LE(2,22);wave.writeUInt32LE(rate,24);wave.writeUInt32LE(rate*4,28);wave.writeUInt16LE(4,32);wave.writeUInt16LE(16,34);wave.write('data',36);wave.writeUInt32LE(count*4,40);
let random = 941;
for(let i=0;i<count;i++) {
  const t=i/rate, beat=.625, dt=t%beat, sub=t%(beat/2);
  const roots=[110,130.8128,87.3071,97.9989];
  const root=roots[Math.min(3,Math.floor(t/7.5))];
  const chord=[root,root*1.189207,root*1.498307,root*2];
  const fade=Math.min(1,t/.5,(30-t)/1.4);
  random=(random*16807)%2147483647;
  const noise=(random/2147483647-.5);
  const kick=.105*Math.exp(-dt*28)*Math.sin(2*Math.PI*(48*dt+.85*(1-Math.exp(-dt*28))));
  const hat=.008*Math.exp(-sub*75)*noise;
  const arp=chord[Math.floor(t/(beat/2))%4]*2;
  const pluck=.038*Math.exp(-sub*10)*Math.sin(2*Math.PI*arp*t);
  for(let channel=0;channel<2;channel++) {
    let pad=0;
    for(let n=0;n<4;n++)pad+=.013*Math.sin(2*Math.PI*chord[n]*t+channel*.13*n)*(1+.1*Math.sin(t*.8));
    const sample=Math.tanh((pad+kick+hat+pluck)*1.3)*fade;
    wave.writeInt16LE(Math.round(sample*32767),44+i*4+channel*2);
  }
}
await fs.writeFile(path.join(out,'original-soundtrack.wav'),wave);
const final = path.join(out,'BR-Burger-LinkedIn-30s.mp4');
execFileSync(ffmpeg,['-y','-i',path.join(out,'showcase-picture.mp4'),'-i',path.join(out,'original-soundtrack.wav'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-af','loudnorm=I=-20:TP=-2:LRA=7','-t','30','-movflags','+faststart',final],{stdio:'pipe'});
execFileSync(ffmpeg,['-y','-ss','1.5','-i',final,'-frames:v','1','-q:v','2',path.join(out,'BR-Burger-LinkedIn-cover.jpg')],{stdio:'pipe'});
execFileSync(ffmpeg,['-v','error','-i',final,'-f','null','-'],{stdio:'pipe'});
const info=execFileSync(ffmpeg,['-hide_banner','-i',final,'-f','null','-'],{stdio:['ignore','pipe','pipe'],encoding:'utf8'});
await fs.writeFile(path.join(out,'VIDEO-NOTES.txt'), 'BR-Burger LinkedIn showcase\n30 seconds · 1080 × 1920 · 30 fps · H.264 + AAC\nActual website captures, edited into seven chapters.\nOriginal procedurally composed soundtrack; no third-party music or samples.\nThe website is an AI-assisted fictional brand concept.\nUpload the MP4 directly to LinkedIn; optional cover JPG included.\n');
console.log(`Finished: ${final}`);
