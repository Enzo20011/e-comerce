import { products } from '../src/data/products.ts';
import { CATEGORY_COVERS } from '../src/pages/HomePage.tsx'; // Wait, it's not exported.
// Just checking the products array first.

async function check() {
  const allUrls = new Set<string>();
  for (const p of products) {
    allUrls.add(p.image);
    p.images.forEach(img => allUrls.add(img));
  }
  
  for (const url of allUrls) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (!res.ok) {
        console.log(`BROKEN: ${url} -> ${res.status}`);
      }
    } catch (e) {
      console.log(`ERROR: ${url} -> ${e.message}`);
    }
  }
  console.log('Done checking ' + allUrls.size + ' images.');
}
check();
