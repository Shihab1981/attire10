import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import TrendingSection from "@/components/TrendingSection";
import TrustBanner from "@/components/TrustBanner";
import FlashSale from "@/components/FlashSale";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSlider />
        <TrustBanner />
        <FlashSale />
        <CategoryGrid />
        <TrendingSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
