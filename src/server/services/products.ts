import { db } from '@/lib/db';
import { cached } from '@/lib/redis';
import { slugify, parseTags } from '@/lib/utils';
import { nanoid } from 'nanoid';

export interface ProductFilters {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
  storeId?: string;
  featured?: boolean;
  pageSize?: number;
}

const PRODUCT_INCLUDE = {
  media: { orderBy: { position: 'asc' } as const },
  store: { select: { id: true, name: true, slug: true, verified: true, region: true } },
  category: { select: { id: true, name: true, slug: true } },
  inventory: true,
} as const;

export async function listProducts(filters: ProductFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 12;

  const where: any = {
    status: 'ACTIVE',
    moderation: 'APPROVED',
    deletedAt: null,
  };
  if (filters.storeId) where.storeId = filters.storeId;
  if (filters.featured) where.featured = true;
  if (filters.category) where.category = { slug: filters.category };
  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {};
    if (filters.minPrice != null) where.price.gte = filters.minPrice;
    if (filters.maxPrice != null) where.price.lte = filters.maxPrice;
  }
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q } },
      { description: { contains: filters.q } },
      { tags: { contains: filters.q.toLowerCase() } },
      { materials: { contains: filters.q } },
    ];
  }

  const orderBy =
    filters.sort === 'newest'
      ? { createdAt: 'desc' as const }
      : filters.sort === 'price_asc'
      ? { price: 'asc' as const }
      : filters.sort === 'price_desc'
      ? { price: 'desc' as const }
      : filters.sort === 'rating'
      ? { rating: 'desc' as const }
      : [{ featured: 'desc' as const }, { rating: 'desc' as const }];

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      include: PRODUCT_INCLUDE,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getFeaturedProducts(limit = 8) {
  return cached(`featured:${limit}`, 60, () =>
    db.product.findMany({
      where: { status: 'ACTIVE', moderation: 'APPROVED', featured: true, deletedAt: null },
      include: PRODUCT_INCLUDE,
      orderBy: { rating: 'desc' },
      take: limit,
    })
  );
}

export async function getProductBySlug(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      ...PRODUCT_INCLUDE,
      variants: true,
      reviews: {
        where: { moderation: 'APPROVED' },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });
  if (product) {
    db.product.update({ where: { id: product.id }, data: { views: { increment: 1 } } }).catch(() => {});
  }
  return product;
}

export async function getRelatedProducts(productId: string, categoryId?: string | null, limit = 4) {
  return db.product.findMany({
    where: {
      id: { not: productId },
      status: 'ACTIVE',
      moderation: 'APPROVED',
      deletedAt: null,
      ...(categoryId ? { categoryId } : {}),
    },
    include: PRODUCT_INCLUDE,
    orderBy: { rating: 'desc' },
    take: limit,
  });
}

export async function createProduct(storeId: string, input: {
  title: string;
  description: string;
  story?: string;
  price: number;
  compareAtPrice?: number;
  categoryId?: string;
  tags?: string;
  materials?: string;
  origin?: string;
  leadTimeDays?: number;
  customizable?: boolean;
  bulkAvailable?: boolean;
  stock?: number;
  mediaUrls?: string[];
}) {
  const slug = `${slugify(input.title)}-${nanoid(6)}`;
  const product = await db.product.create({
    data: {
      storeId,
      title: input.title,
      slug,
      description: input.description,
      story: input.story,
      price: input.price,
      compareAtPrice: input.compareAtPrice,
      categoryId: input.categoryId,
      tags: parseTags(input.tags).join(','),
      materials: input.materials,
      origin: input.origin,
      leadTimeDays: input.leadTimeDays ?? 3,
      customizable: input.customizable ?? false,
      bulkAvailable: input.bulkAvailable ?? false,
      status: 'ACTIVE',
      moderation: 'PENDING',
      inventory: { create: { available: input.stock ?? 0 } },
      media: input.mediaUrls?.length
        ? {
            create: input.mediaUrls.map((url, i) => ({
              url,
              type: 'image',
              position: i,
              alt: input.title,
            })),
          }
        : undefined,
    },
    include: PRODUCT_INCLUDE,
  });
  return product;
}

export async function updateProductRating(productId: string) {
  const agg = await db.review.aggregate({
    where: { productId, moderation: 'APPROVED' },
    _avg: { rating: true },
    _count: true,
  });
  await db.product.update({
    where: { id: productId },
    data: {
      rating: agg._avg.rating ?? 0,
      ratingCount: agg._count,
    },
  });
}
