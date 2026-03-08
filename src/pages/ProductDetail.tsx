import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { products, type Size } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SizeGuide from "@/components/SizeGuide";
import ProductCard from "@/components/ProductCard";
import { ShoppingBag, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const addItem = useCartStore((s) => s.addItem);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-2">Product Not Found</h1>
            <Link to="/products" className="text-accent hover:underline text-sm">
              Back to Products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addItem(product, selectedSize);
    toast.success(`${product.name} added to cart`);
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-6 md:py-12">
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft size={16} /> Back to Products
          </Link>

          <div className="grid md:grid-cols-2 gap-8 md:gap-16">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-[3/4] bg-secondary overflow-hidden"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col"
            >
              <p className="text-xs text-muted-foreground tracking-wider uppercase mb-2">
                {product.category.replace("-", " ")} / {product.subCategory}
              </p>
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 mb-6">
                <span className="font-display text-2xl font-bold">
                  ৳{product.price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-muted-foreground line-through text-lg">
                    ৳{product.originalPrice!.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                {product.description}
              </p>

              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display font-semibold text-sm">Select Size</h3>
                <SizeGuide />
              </div>
              <div className="flex flex-wrap gap-2 mb-8">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-12 h-12 text-sm font-medium border transition-colors ${
                      selectedSize === s
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="text-xs text-muted-foreground mb-6">
                <span className="font-medium text-foreground">Fabric:</span> {product.fabric}
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 bg-foreground text-background py-4 font-display font-semibold text-sm tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <ShoppingBag size={18} />
                Add to Cart
              </button>
            </motion.div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-16 md:mt-24">
              <h2 className="font-display text-xl md:text-2xl font-bold mb-8">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
