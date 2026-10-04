import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

// Local, brand-crafted cinematic imagery (bundled in /public/images).
// Guarantees zero broken images and a consistent luxury aesthetic.
const IMAGES = {
  hero: '/images/hero-potter.jpg',
  bowl: '/images/bowl-indigo.jpg',
  brass: '/images/brass-urli.jpg',
  terracotta: '/images/terracotta-platter.jpg',
  vase: '/images/ceramic-vase.jpg',
  silk: '/images/silk-scarf.jpg',
  cotton: '/images/cotton-throw.jpg',
} as const;
type ImgKey = keyof typeof IMAGES;
const IMG = (key: ImgKey) => IMAGES[key];

async function main() {
  console.log('🌱 Seeding Karu marketplace…');

  // Clean (dev only)
  await db.$transaction([
    db.cartItem.deleteMany(),
    db.cart.deleteMany(),
    db.refund.deleteMany(),
    db.payment.deleteMany(),
    db.orderItem.deleteMany(),
    db.order.deleteMany(),
    db.review.deleteMany(),
    db.wishlistItem.deleteMany(),
    db.media.deleteMany(),
    db.inventory.deleteMany(),
    db.productVariant.deleteMany(),
    db.product.deleteMany(),
    db.storeFollow.deleteMany(),
    db.store.deleteMany(),
    db.category.deleteMany(),
    db.campaign.deleteMany(),
    db.notification.deleteMany(),
    db.supportTicket.deleteMany(),
    db.analyticsEvent.deleteMany(),
    db.auditLog.deleteMany(),
    db.account.deleteMany(),
    db.session.deleteMany(),
    db.user.deleteMany(),
  ]);

  const hash = await bcrypt.hash('password123', 10);

  // ── Users ───────────────────────────────────────────────────
  const admin = await db.user.create({
    data: { name: 'Karu Admin', email: 'admin@karu.market', passwordHash: hash, role: 'SUPER_ADMIN', emailVerified: new Date() },
  });
  const buyer = await db.user.create({
    data: { name: 'Aarav Sharma', email: 'buyer@karu.market', passwordHash: hash, role: 'BUYER', emailVerified: new Date(), loyaltyPoints: 320 },
  });
  await db.address.create({
    data: { userId: buyer.id, fullName: 'Aarav Sharma', phone: '9876543210', line1: '12 Lotus Avenue', city: 'Bengaluru', state: 'Karnataka', postalCode: '560001', isDefault: true },
  });

  const sellers = await Promise.all([
    db.user.create({ data: { name: 'Meera Devi', email: 'meera@karu.market', passwordHash: hash, role: 'SELLER', emailVerified: new Date() } }),
    db.user.create({ data: { name: 'Rohan Kumar', email: 'rohan@karu.market', passwordHash: hash, role: 'SELLER', emailVerified: new Date() } }),
    db.user.create({ data: { name: 'Lakshmi Crafts', email: 'lakshmi@karu.market', passwordHash: hash, role: 'BUSINESS_SELLER', emailVerified: new Date() } }),
  ]);

  // ── Categories ──────────────────────────────────────────────
  const cats = await Promise.all(
    [
      { name: 'Pottery & Ceramics', slug: 'pottery', imageUrl: IMG('bowl') },
      { name: 'Textiles & Weaves', slug: 'textiles', imageUrl: IMG('silk') },
      { name: 'Jewellery', slug: 'jewellery', imageUrl: IMG('brass') },
      { name: 'Home & Decor', slug: 'home-decor', imageUrl: IMG('vase') },
      { name: 'Woodcraft', slug: 'woodcraft', imageUrl: IMG('terracotta') },
      { name: 'Metalwork', slug: 'metalwork', imageUrl: IMG('brass') },
    ].map((c) => db.category.create({ data: c }))
  );
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c]));

  // ── Stores ──────────────────────────────────────────────────
  const stores = await Promise.all([
    db.store.create({
      data: {
        ownerId: sellers[0].id, name: 'Mitti Studio', slug: 'mitti-studio',
        tagline: 'Earthen vessels, thrown by hand', region: 'Jaipur, Rajasthan',
        craftType: 'Blue Pottery', status: 'ACTIVE', verified: true, kycStatus: 'VERIFIED',
        rating: 4.8, ratingCount: 214,
        logoUrl: IMG('bowl'),
        bannerUrl: IMG('hero'),
        story: 'For three generations, our family has turned the blue clay of Jaipur into living art. Each piece is glazed with mineral pigments and fired in wood kilns, the way our grandmother taught us.',
      },
    }),
    db.store.create({
      data: {
        ownerId: sellers[1].id, name: 'Loom & Lore', slug: 'loom-and-lore',
        tagline: 'Handwoven textiles with a soul', region: 'Varanasi, Uttar Pradesh',
        craftType: 'Handloom Weaving', status: 'ACTIVE', verified: true, kycStatus: 'VERIFIED',
        rating: 4.9, ratingCount: 389,
        logoUrl: IMG('silk'),
        bannerUrl: IMG('cotton'),
        story: 'Every thread carries the rhythm of the loom and the memory of the weaver. We work with master artisans of Varanasi to bring you textiles that have stories woven in.',
      },
    }),
    db.store.create({
      data: {
        ownerId: sellers[2].id, name: 'Lakshmi Atelier', slug: 'lakshmi-atelier',
        tagline: 'Heirloom jewellery, reimagined', region: 'Chennai, Tamil Nadu',
        craftType: 'Temple Jewellery', status: 'ACTIVE', verified: true, kycStatus: 'VERIFIED',
        rating: 4.7, ratingCount: 156,
        logoUrl: IMG('brass'),
        bannerUrl: IMG('brass'),
        story: 'Our atelier blends centuries-old temple jewellery techniques with contemporary design, crafting pieces that honour tradition while feeling utterly now.',
      },
    }),
  ]);

  // ── Products ────────────────────────────────────────────────
  const productData = [
    { store: 0, cat: 'pottery', title: 'Indigo Glazed Stoneware Bowl', price: 189000, compare: 240000, materials: 'Stoneware clay, mineral glaze', img: 'bowl', img2: 'vase', featured: true, tags: 'pottery,handmade,blue,bowl,kitchen' },
    { store: 0, cat: 'pottery', title: 'Terracotta Serving Platter', price: 145000, materials: 'Terracotta', img: 'terracotta', img2: 'bowl', featured: false, tags: 'pottery,terracotta,serving,festive' },
    { store: 0, cat: 'home-decor', title: 'Hand-thrown Ceramic Vase', price: 215000, compare: 260000, materials: 'Ceramic, matte glaze', img: 'vase', img2: 'bowl', featured: true, tags: 'vase,decor,ceramic,minimal' },
    { store: 1, cat: 'textiles', title: 'Banarasi Silk Handwoven Scarf', price: 320000, compare: 400000, materials: 'Pure mulberry silk, zari', img: 'silk', img2: 'cotton', featured: true, tags: 'silk,scarf,handwoven,wedding,luxury' },
    { store: 1, cat: 'textiles', title: 'Block-Printed Cotton Throw', price: 175000, materials: 'Organic cotton, natural dyes', img: 'cotton', img2: 'silk', featured: false, tags: 'cotton,throw,block-print,home' },
    { store: 1, cat: 'textiles', title: 'Kantha Embroidered Stole', price: 142000, materials: 'Cotton, hand embroidery', img: 'cotton', img2: 'silk', featured: false, tags: 'kantha,stole,embroidery,gift' },
    { store: 2, cat: 'jewellery', title: 'Temple Gold-Plated Jhumkas', price: 285000, compare: 350000, materials: 'Brass, 22k gold plating', img: 'brass', img2: 'vase', featured: true, tags: 'jewellery,jhumka,temple,wedding,festive' },
    { store: 2, cat: 'jewellery', title: 'Silver Filigree Pendant', price: 198000, materials: 'Sterling silver', img: 'brass', img2: 'vase', featured: false, tags: 'silver,pendant,filigree,minimal' },
    { store: 0, cat: 'metalwork', title: 'Brass Diya Lamp Set', price: 125000, materials: 'Cast brass', img: 'brass', img2: 'terracotta', featured: true, tags: 'brass,diya,diwali,festive,lamp' },
    { store: 1, cat: 'woodcraft', title: 'Carved Sheesham Wooden Tray', price: 165000, materials: 'Sheesham wood', img: 'terracotta', img2: 'brass', featured: false, tags: 'wood,tray,carved,serving' },
    { store: 2, cat: 'home-decor', title: 'Marble Inlay Coaster Set', price: 158000, compare: 195000, materials: 'Makrana marble, semi-precious stones', img: 'vase', img2: 'bowl', featured: true, tags: 'marble,coaster,inlay,luxury,gift' },
    { store: 0, cat: 'pottery', title: 'Glazed Ceramic Tea Set', price: 340000, compare: 420000, materials: 'Porcelain, hand glaze', img: 'bowl', img2: 'vase', featured: true, tags: 'tea,ceramic,set,gift,luxury' },
  ];

  const createdProducts = [];
  for (let i = 0; i < productData.length; i++) {
    const p = productData[i];
    const slug = p.title.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '') + '-' + i;
    const product = await db.product.create({
      data: {
        storeId: stores[p.store].id,
        categoryId: catBySlug[p.cat].id,
        title: p.title,
        slug,
        description: `A ${p.title.toLowerCase()} crafted with patience and precision. Made from ${p.materials.toLowerCase()}, this piece embodies the quiet luxury of slow-made craft — built to be treasured, gifted, and passed down.`,
        story: 'Born from the hands of master artisans, this piece carries the imperfections that make handmade objects truly alive. No two are ever identical.',
        price: p.price,
        compareAtPrice: p.compare,
        materials: p.materials,
        origin: stores[p.store].region ?? 'India',
        status: 'ACTIVE',
        moderation: 'APPROVED',
        featured: p.featured,
        tags: p.tags,
        customizable: i % 3 === 0,
        bulkAvailable: i % 4 === 0,
        rating: 4.3 + (i % 7) * 0.1,
        ratingCount: 12 + i * 7,
        views: 200 + i * 53,
        inventory: { create: { available: 8 + (i % 5) * 4, lowStockAt: 5 } },
        media: {
          create: [
            { url: IMG(p.img as ImgKey), type: 'image', position: 0, alt: p.title },
            { url: IMG(p.img2 as ImgKey), type: 'image', position: 1, alt: p.title },
          ],
        },
      },
    });
    createdProducts.push(product);
  }

  // ── Reviews ─────────────────────────────────────────────────
  const reviewBodies = [
    { rating: 5, title: 'Absolutely stunning', body: 'The craftsmanship is incredible. You can feel the love that went into making this. Even more beautiful in person.' },
    { rating: 5, title: 'Worth every rupee', body: 'Premium quality, beautifully packaged. The artisan even included a handwritten note.' },
    { rating: 4, title: 'Beautiful piece', body: 'Lovely product and great quality. Shipping took a little longer but the wait was worth it.' },
  ];
  for (let i = 0; i < 6; i++) {
    const product = createdProducts[i];
    const r = reviewBodies[i % reviewBodies.length];
    await db.review.create({
      data: { productId: product.id, userId: buyer.id, rating: r.rating, title: r.title, body: r.body, verified: true },
    });
  }

  // ── Wishlist ────────────────────────────────────────────────
  await db.wishlistItem.create({ data: { userId: buyer.id, productId: createdProducts[3].id } });
  await db.wishlistItem.create({ data: { userId: buyer.id, productId: createdProducts[6].id } });

  // ── Campaigns ───────────────────────────────────────────────
  await db.campaign.createMany({
    data: [
      { name: 'Diwali Collection', slug: 'diwali', theme: 'diwali', headline: 'Light, Made by Hand', description: 'Illuminate the festival of lights with handcrafted treasures.', heroImage: IMG('brass'), active: true, productIds: createdProducts.slice(8, 11).map((p) => p.id).join(',') },
      { name: 'Wedding Atelier', slug: 'wedding', theme: 'wedding', headline: 'Vows, Honoured in Craft', description: 'Heirloom-worthy pieces for the day that lasts forever.', heroImage: IMG('silk'), active: true, productIds: createdProducts.slice(3, 7).map((p) => p.id).join(',') },
    ],
  });

  console.log('✅ Seed complete.');
  console.log('   Admin:  admin@karu.market / password123');
  console.log('   Buyer:  buyer@karu.market / password123');
  console.log('   Seller: meera@karu.market / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
