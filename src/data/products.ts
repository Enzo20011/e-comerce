import type { Product } from '../types/product'

function images(seed: string): string[] {
  return [1, 2, 3, 4].map((n) => `https://picsum.photos/seed/${seed}-${n}/800/800`)
}

export const CATEGORIES = ['Electrónica', 'Ropa', 'Hogar', 'Accesorios', 'Deportes'] as const

function product(data: Omit<Product, 'image' | 'images'> & { seed: string }): Product {
  const { seed, ...rest } = data
  const gallery = images(seed)
  return { ...rest, image: gallery[0], images: gallery }
}

export const products: Product[] = [
  // Electrónica
  product({
    id: 'auriculares-aura',
    seed: 'auriculares-aura',
    name: 'Auriculares Inalámbricos Aura',
    description:
      'Auriculares over-ear con cancelación activa de ruido y hasta 30 horas de batería.',
    price: 89.99,
    category: 'Electrónica',
    stock: 24,
    rating: 4.6,
    featured: true,
  }),
  product({
    id: 'parlante-nomad',
    seed: 'parlante-nomad',
    name: 'Parlante Bluetooth Nomad',
    description: 'Parlante portátil resistente al agua con 12 horas de reproducción continua.',
    price: 59.99,
    category: 'Electrónica',
    stock: 40,
    rating: 4.3,
  }),
  product({
    id: 'reloj-pulse',
    seed: 'reloj-pulse',
    name: 'Reloj Inteligente Pulse',
    description: 'Monitoreo de frecuencia cardíaca, sueño y entrenamiento con pantalla AMOLED.',
    price: 129.99,
    category: 'Electrónica',
    stock: 15,
    rating: 4.5,
  }),
  product({
    id: 'camara-lume',
    seed: 'camara-lume',
    name: 'Cámara Instantánea Lume',
    description: 'Cámara compacta de fotos instantáneas con flash automático y lente gran angular.',
    price: 74.99,
    category: 'Electrónica',
    stock: 18,
    rating: 4.2,
  }),

  // Ropa
  product({
    id: 'campera-tundra',
    seed: 'campera-tundra',
    name: 'Campera Rompevientos Tundra',
    description: 'Campera liviana impermeable, ideal para trekking y uso diario en climas fríos.',
    price: 64.99,
    category: 'Ropa',
    stock: 30,
    rating: 4.4,
  }),
  product({
    id: 'buzo-cronos',
    seed: 'buzo-cronos',
    name: 'Buzo Oversize Cronos',
    description: 'Buzo de algodón con corte oversize y interior afelpado.',
    price: 45.99,
    category: 'Ropa',
    stock: 50,
    rating: 4.7,
    featured: true,
  }),
  product({
    id: 'remera-terra',
    seed: 'remera-terra',
    name: 'Remera Básica Terra',
    description: 'Remera de algodón peinado 100%, corte regular, colores tierra.',
    price: 19.99,
    category: 'Ropa',
    stock: 100,
    rating: 4.1,
  }),
  product({
    id: 'pantalon-atlas',
    seed: 'pantalon-atlas',
    name: 'Pantalón Cargo Atlas',
    description: 'Pantalón cargo resistente con múltiples bolsillos y cintura ajustable.',
    price: 54.99,
    category: 'Ropa',
    stock: 35,
    rating: 4.3,
  }),

  // Hogar
  product({
    id: 'tazas-nube',
    seed: 'tazas-nube',
    name: 'Set de Tazas Cerámica Nube',
    description: 'Juego de 4 tazas de cerámica artesanal, aptas para microondas y lavavajillas.',
    price: 28.99,
    category: 'Hogar',
    stock: 45,
    rating: 4.5,
  }),
  product({
    id: 'lampara-faro',
    seed: 'lampara-faro',
    name: 'Lámpara de Mesa Faro',
    description: 'Lámpara regulable con luz cálida y base de madera natural.',
    price: 39.99,
    category: 'Hogar',
    stock: 20,
    rating: 4.4,
  }),
  product({
    id: 'manta-abrigo',
    seed: 'manta-abrigo',
    name: 'Manta Tejida Abrigo',
    description: 'Manta de punto grueso, súper suave, ideal para el sillón o la cama.',
    price: 49.99,
    category: 'Hogar',
    stock: 25,
    rating: 4.8,
    featured: true,
  }),
  product({
    id: 'difusor-bruma',
    seed: 'difusor-bruma',
    name: 'Difusor de Aromas Bruma',
    description: 'Difusor ultrasónico con luz LED y apagado automático.',
    price: 34.99,
    category: 'Hogar',
    stock: 30,
    rating: 4.2,
  }),

  // Accesorios
  product({
    id: 'mochila-voyager',
    seed: 'mochila-voyager',
    name: 'Mochila Urbana Voyager',
    description: 'Mochila con compartimento acolchado para laptop de hasta 15 pulgadas.',
    price: 79.99,
    category: 'Accesorios',
    stock: 22,
    rating: 4.6,
  }),
  product({
    id: 'billetera-nordic',
    seed: 'billetera-nordic',
    name: 'Billetera de Cuero Nordic',
    description: 'Billetera de cuero genuino con protección RFID.',
    price: 32.99,
    category: 'Accesorios',
    stock: 60,
    rating: 4.3,
  }),
  product({
    id: 'gorra-horizon',
    seed: 'gorra-horizon',
    name: 'Gorra Clásica Horizon',
    description: 'Gorra de algodón con cierre ajustable y bordado minimalista.',
    price: 24.99,
    category: 'Accesorios',
    stock: 70,
    rating: 4.0,
  }),

  // Deportes
  product({
    id: 'botella-glaciar',
    seed: 'botella-glaciar',
    name: 'Botella Térmica Glaciar',
    description: 'Botella de acero inoxidable, mantiene el frío 24hs y el calor 12hs.',
    price: 22.99,
    category: 'Deportes',
    stock: 80,
    rating: 4.7,
    featured: true,
  }),
  product({
    id: 'colchoneta-flow',
    seed: 'colchoneta-flow',
    name: 'Colchoneta de Yoga Flow',
    description: 'Colchoneta antideslizante de 6mm, incluye correa de transporte.',
    price: 36.99,
    category: 'Deportes',
    stock: 40,
    rating: 4.5,
  }),
  product({
    id: 'mancuernas-core',
    seed: 'mancuernas-core',
    name: 'Mancuernas Ajustables Core',
    description: 'Par de mancuernas ajustables de 2 a 10kg, sistema de cambio rápido.',
    price: 99.99,
    category: 'Deportes',
    stock: 12,
    rating: 4.6,
  }),
]
