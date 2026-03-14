import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import TrendingSection from "@/components/TrendingSection";
import TrustBanner from "@/components/TrustBanner";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
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
