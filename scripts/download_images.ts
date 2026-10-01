import fs from 'node:fs';
import path from 'node:path';
import { db } from './db.ts';

const PUBLIC_DIR = path.join(process.cwd(), 'public', 'images');
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

const prompts = {
  'auriculares-aura': 'professional product photography of sleek wireless over-ear headphones, minimalist studio lighting, high resolution',
  'parlante-nomad': 'professional product photography of a portable waterproof bluetooth speaker, minimalist studio lighting, high resolution',
  'reloj-pulse': 'professional product photography of a modern sleek smartwatch, minimalist studio lighting, high resolution',
  'camara-lume': 'professional product photography of a compact instant camera polaroid style, minimalist studio lighting, high resolution',
  'campera-tundra': 'professional product photography of a winter windbreaker jacket, minimalist studio lighting, high resolution',
  'buzo-cronos': 'professional product photography of an oversized cotton hoodie, minimalist studio lighting, high resolution',
  'remera-terra': 'professional product photography of a basic earth tone t-shirt folded, minimalist studio lighting, high resolution',
  'pantalon-atlas': 'professional product photography of robust cargo pants, minimalist studio lighting, high resolution',
  'tazas-nube': 'professional product photography of ceramic coffee mugs pastel colors, minimalist studio lighting, high resolution',
  'lampara-faro': 'professional product photography of a minimalist desk lamp with wooden base, minimalist studio lighting, high resolution',
  'manta-abrigo': 'professional product photography of a chunky knit cozy blanket, minimalist studio lighting, high resolution',
  'difusor-bruma': 'professional product photography of an ultrasonic aroma diffuser, minimalist studio lighting, high resolution',
  'mochila-voyager': 'professional product photography of an urban sleek laptop backpack, minimalist studio lighting, high resolution',
  'billetera-nordic': 'professional product photography of a genuine leather slim wallet, minimalist studio lighting, high resolution',
  'gorra-horizon': 'professional product photography of a classic minimalist baseball cap, minimalist studio lighting, high resolution',
  'botella-glaciar': 'professional product photography of a stainless steel thermos water bottle, minimalist studio lighting, high resolution',
  'colchoneta-flow': 'professional product photography of a rolled up yoga mat, minimalist studio lighting, high resolution',
  'mancuernas-core': 'professional product photography of adjustable fitness dumbbells, minimalist studio lighting, high resolution'
};

async function download() {
  const updateStmt = db.prepare('UPDATE products SET image = ?, images = ? WHERE id = ?');
  
  for (const [id, prompt] of Object.entries(prompts)) {
    const filename = `/images/${id}.jpg`;
    const fullPath = path.join(PUBLIC_DIR, `${id}.jpg`);
    
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).size > 1000) {
      console.log(`Skipping ${id}, already downloaded.`);
      continue;
    }
    
    console.log(`Downloading for ${id}...`);
    const encoded = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=800&height=800&nologo=true`;
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(fullPath, Buffer.from(buffer));
      
      updateStmt.run(filename, JSON.stringify([filename]), id);
      console.log(`Saved ${filename}`);
    } catch (e) {
      console.error(`Failed for ${id}:`, e.message);
    }
  }
  
  const cats = {
    'cat-electronica': 'professional product photography of modern electronic gadgets flatlay, minimalist studio lighting',
    'cat-ropa': 'professional product photography of folded neat clothing apparel, minimalist studio lighting',
    'cat-hogar': 'professional interior design photography of cozy home decor, minimalist studio lighting',
    'cat-accesorios': 'professional product photography of elegant accessories, minimalist studio lighting',
    'cat-deportes': 'professional product photography of fitness gym equipment, minimalist studio lighting'
  };
  
  for (const [id, prompt] of Object.entries(cats)) {
    const fullPath = path.join(PUBLIC_DIR, `${id}.jpg`);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).size > 1000) continue;
    
    console.log(`Downloading category ${id}...`);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=800&nologo=true`;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(fullPath, Buffer.from(buffer));
      console.log(`Saved /images/${id}.jpg`);
    } catch (e) {}
  }
}

download();
