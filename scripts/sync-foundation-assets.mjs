// Explicit serving-copy refresh only. Authoring belongs in the shared source.
import { copyFile, mkdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const foundation = new URL('./', import.meta.resolve('@citizen-infra/design-system/tokens.css'));
const images = ['favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png', 'og-image.png'];
const fonts = ['public-sans-latin-normal.woff2', 'public-sans-latin-italic.woff2', 'OFL-Public-Sans.txt'];
await mkdir(new URL('assets/brand/', root), { recursive: true });
await mkdir(new URL('public/fonts/', root), { recursive: true });
for (const name of images) await copyFile(new URL(`brand/${name}`, foundation), new URL(`public/${name}`, root));
for (const name of fonts) await copyFile(new URL(`fonts/${name}`, foundation), new URL(`public/fonts/${name}`, root));
await copyFile(new URL('brand/provenance.json', foundation), new URL('assets/brand/provenance.json', root));
console.log(`Synced ${images.length} images, ${fonts.length} font/licence files, and upstream provenance from the installed foundation. No artwork rendered.`);
