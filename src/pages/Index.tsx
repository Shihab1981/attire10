import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import TrendingSection from "@/components/TrendingSection";
import TrustBanner from "@/components/TrustBanner";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import PageSeo from "@/components/PageSeo";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const HOME_TITLE = "Device Hub — Gadgets, Phones & Accessories in BD";
const HOME_DESC =
  "Buy phones, earbuds, smartwatches, laptops and gadget accessories in Bangladesh from Device Hub — genuine products, warranty and fast delivery.";

const homeJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: HOME_DESC,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/products?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <PageSeo title={HOME_TITLE} description={HOME_DESC} path="/" jsonLd={homeJsonLd} />
      <Header />
      <main className="flex-1">

        <HeroSlider />
        <TrustBanner />
        <CategoryGrid />
        <TrendingSection />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
