import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'server', 'data.db');
const db = new DatabaseSync(DB_PATH);

const products = db.prepare('SELECT id FROM products').all() as { id: string }[];
const updateStmt = db.prepare('UPDATE products SET image = ?, images = ? WHERE id = ?');

for (const { id } of products) {
  const filename = `/images/${id}.jpg`;
  updateStmt.run(filename, JSON.stringify([filename]), id);
  console.log(`Updated ${id} to ${filename}`);
}

console.log('Done!');
