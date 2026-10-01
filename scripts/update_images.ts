import { db } from '../server/db.ts';
import { products } from '../src/data/products.ts';

const updateStmt = db.prepare('UPDATE products SET image = ?, images = ? WHERE id = ?');

let updated = 0;
for (const p of products) {
  const result = updateStmt.run(p.image, JSON.stringify(p.images), p.id);
  if (result.changes > 0) updated++;
}
console.log(`Updated images for ${updated} products.`);
