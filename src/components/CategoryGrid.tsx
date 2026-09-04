import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

const CategorySkeleton = () => (
  <section className="py-8 md:py-12">
    <div className="container">
      <div className="flex items-end justify-between mb-5 md:mb-7">
        <div className="space-y-2">
          <div className="h-2.5 w-24 bg-muted-foreground/15 rounded animate-pulse" />
          <div className="h-6 w-40 bg-muted-foreground/15 rounded animate-pulse" />
        </div>
        <div className="h-3 w-16 bg-muted-foreground/10 rounded animate-pulse" />
      </div>
      {/* Mobile: 2 lines (3 columns x 2 rows) */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-secondary animate-pulse rounded-xl"
          />
        ))}
      </div>
      {/* Desktop: horizontal marquee */}
      <div className="hidden md:block overflow-hidden">
        <div className="flex gap-3 md:gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-40 md:w-52 lg:w-56 aspect-[3/4] bg-secondary animate-pulse rounded-xl flex-shrink-0"
            />
          ))}
        </div>
      </div>
    </div>
  </section>
);

const CategoryCard = ({
  cat,
  mobile = false,
}: {
  cat: { slug: string; image: string; name: string; description?: string };
  mobile?: boolean;
}) => (
  <Link
    to={`/products?category=${cat.slug}`}
    className={`group relative block overflow-hidden rounded-xl ${
      mobile
        ? "aspect-square"
        : "w-36 sm:w-40 md:w-52 lg:w-56 aspect-[3/4] flex-shrink-0"
    }`}
  >
    <img
      src={cat.image}
      alt={cat.name}
      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 brightness-[0.85] group-hover:brightness-100"
      loading="lazy"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
    <div className="absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-500 w-0 group-hover:w-full" />
    <div
      className={`absolute bottom-0 left-0 right-0 flex items-end justify-between ${
        mobile ? "p-1.5" : "p-2.5 md:p-3"
      }`}
    >
      <div>
        <h3
          className={`font-display font-bold text-primary-foreground leading-tight ${
            mobile ? "text-[10px]" : "text-xs md:text-sm"
          }`}
        >
          {cat.name}
        </h3>
        {cat.description && !mobile && (
          <p className="text-[9px] text-primary-foreground/70 font-body hidden md:block">
            {cat.description}
          </p>
        )}
      </div>
      {!mobile && (
        <ArrowUpRight
          size={12}
          className="text-primary-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        />
      )}
    </div>
  </Link>
);

const CategoryGrid = () => {
  const { categories } = useCategories();

  if (categories.length === 0) return <CategorySkeleton />;

  const duplicated = [...categories, ...categories];

  return (
    <section className="py-8 md:py-12 overflow-hidden">
      <div className="container">
        <div className="flex items-end justify-between mb-5 md:mb-7">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-1">
              Curated Selection
            </p>
            <h2 className="font-display text-xl md:text-2xl font-extrabold tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Link
            to="/products"
            className="text-[11px] font-body font-semibold tracking-[0.15em] uppercase text-accent hover:text-accent/80 transition-colors"
          >
            View All
          </Link>
        </div>

        {/* Mobile: smaller cards in 2 lines */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          {categories.map((cat) => (
            <CategoryCard key={cat.slug} cat={cat} mobile />
          ))}
        </div>

        {/* Desktop: single-line marquee */}
        <div className="hidden md:block relative overflow-hidden">
          <div className="flex gap-3 md:gap-4 w-max animate-marquee-categories hover:[animation-play-state:paused]">
            {duplicated.map((cat, i) => (
              <CategoryCard key={`${cat.slug}-${i}`} cat={cat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
