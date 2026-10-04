import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { Reveal, StaggerGroup, StaggerItem } from '@/components/motion/reveal';

export async function CategoriesSection() {
  const categories = await db.category.findMany({
    where: { parentId: null },
    take: 6,
    include: { _count: { select: { products: true } } },
  });

  return (
    <section className="container-wide py-28">
      <Reveal className="mb-14">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-champagne-500">
          Explore by craft
        </p>
        <h2 className="text-display-lg font-bold">Six worlds of making.</h2>
      </Reveal>

      <StaggerGroup className="grid auto-rows-[16rem] grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat, i) => (
          <StaggerItem
            key={cat.id}
            className={i === 0 ? 'col-span-2 row-span-2' : i === 3 ? 'lg:col-span-2' : ''}
          >
            <Link
              href={`/discover?category=${cat.slug}`}
              className="group relative block h-full overflow-hidden rounded-2xl bg-secondary"
            >
              {cat.imageUrl && (
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width:768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-graphite-950/80 via-graphite-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="font-display text-xl font-semibold text-white">{cat.name}</h3>
                <p className="text-sm text-white/70">{cat._count.products} pieces</p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
