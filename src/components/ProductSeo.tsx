import { Helmet } from "react-helmet-async";
import { resolveSeo, SITE_NAME, SITE_URL, type SeoInput } from "@/lib/seo";

type Props = {
  product: SeoInput & {
    id: string;
    price: number;
    image_url?: string;
    in_stock?: boolean;
    stock_quantity?: number;
  };
  image: string;
};

/** Injects per-product head metadata + Product JSON-LD. */
const ProductSeo = ({ product, image }: Props) => {
  const { title, description, slug, alt } = resolveSeo(product);
  const url = `${SITE_URL}/product/${slug}`;
  const absImage = image?.startsWith("http") ? image : `${SITE_URL}${image || ""}`;
  const keywords = (product.seo_keywords || []).filter(Boolean);
  const inStock = product.in_stock !== false && (product.stock_quantity ?? 1) > 0;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    image: absImage ? [absImage] : undefined,
    sku: product.id,
    url,
    ...(product.brand?.trim() ? { brand: { "@type": "Brand", name: product.brand.trim() } } : {}),
    offers: {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: "BDT",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(", ")} />}
      <link rel="canonical" href={url} />
      <meta property="og:type" content="product" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      {absImage && <meta property="og:image" content={absImage} />}
      {absImage && <meta property="og:image:alt" content={alt} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {absImage && <meta name="twitter:image" content={absImage} />}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default ProductSeo;
