import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCartStore } from "@/store/cartStore";
import { categoryImages, type Category } from "@/data/products";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore();

  const getImage = (item: typeof items[0]) => {
    const url = item.product.image_url;
    return url && url !== "/placeholder.svg" ? url : categoryImages[item.product.category as Category] || "/placeholder.svg";
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-10 md:py-16">
          {/* Page Header */}
          <div className="flex items-end justify-between mb-10 md:mb-14 border-b border-border pb-6">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-2">Shopping</p>
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Your Cart</h1>
            </div>
            {items.length > 0 && (
              <p className="text-sm text-muted-foreground font-body">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
            )}
          </div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24"
            >
              <div className="w-20 h-20 mx-auto mb-6 border border-border rounded-full flex items-center justify-center">
                <ShoppingBag size={28} className="text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground text-sm font-body mb-8 max-w-xs mx-auto">
                Looks like you haven't added anything yet. Explore our collection to find something you love.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-foreground text-background px-8 py-3.5 font-display font-semibold text-sm tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Explore Collection
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8 md:gap-14">
              {/* Cart Items */}
              <div className="lg:col-span-7 xl:col-span-8">
                {/* Table Header - Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body pb-4 border-b border-border">
                  <span className="col-span-6">Product</span>
                  <span className="col-span-2 text-center">Quantity</span>
                  <span className="col-span-2 text-center">Price</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>

                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      key={`${item.product.id}-${item.size}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ delay: index * 0.05 }}
                      className="md:grid md:grid-cols-12 md:gap-4 md:items-center py-6 border-b border-border"
                    >
                      {/* Product Info */}
                      <div className="md:col-span-6 flex gap-4">
                        <Link
                          to={`/product/${item.product.id}`}
                          className="w-20 h-28 md:w-24 md:h-32 bg-secondary shrink-0 overflow-hidden group"
                        >
                          <img
                            src={getImage(item)}
                            alt={item.product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </Link>
                        <div className="flex flex-col justify-center min-w-0">
                          <Link
                            to={`/product/${item.product.id}`}
                            className="font-display font-semibold text-sm md:text-base hover:text-accent transition-colors line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body mt-1.5">
                            Size: {item.size}
                          </p>
                          <p className="md:hidden font-body font-semibold text-sm mt-2">
                            ৳{item.product.price.toLocaleString()}
                          </p>
                          <button
                            onClick={() => removeItem(item.product.id, item.size)}
                            className="mt-2 text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-destructive transition-colors font-body flex items-center gap-1 w-fit"
                          >
                            <X size={12} />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Quantity - Mobile inline / Desktop centered */}
                      <div className="md:col-span-2 flex md:justify-center mt-4 md:mt-0">
                        <div className="flex items-center border border-border">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-secondary transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-display font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-secondary transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Unit Price - Desktop only */}
                      <div className="hidden md:flex md:col-span-2 justify-center">
                        <span className="font-body text-sm text-muted-foreground">৳{item.product.price.toLocaleString()}</span>
                      </div>

                      {/* Line Total */}
                      <div className="hidden md:flex md:col-span-2 justify-end">
                        <span className="font-display font-semibold text-sm">
                          ৳{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="mt-6 flex items-center gap-6">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body group"
                  >
                    <ArrowRight size={14} className="rotate-180 transition-transform group-hover:-translate-x-1" />
                    Continue Shopping
                  </Link>
                  <Link
                    to="/track-order"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-body group"
                  >
                    <Package size={14} />
                    Track Order
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-5 xl:col-span-4">
                <div className="sticky top-24 bg-secondary/40 border border-border p-6 md:p-8">
                  <h2 className="font-display font-bold text-lg mb-6 pb-4 border-b border-border">Order Summary</h2>

                  <div className="space-y-4 text-sm font-body">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                      <span className="font-medium">৳{totalPrice().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Package size={14} />
                        Shipping (Inside Dhaka)
                      </span>
                      <span>৳60</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Package size={14} />
                        Shipping (Outside Dhaka)
                      </span>
                      <span>৳120</span>
                    </div>
                  </div>

                  <div className="border-t border-border mt-6 pt-6 space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-muted-foreground font-body">Due (Inside Dhaka)</span>
                      <span className="font-display font-bold text-base">৳{(totalPrice() + 60).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-sm text-muted-foreground font-body">Due (Outside Dhaka)</span>
                      <span className="font-display font-bold text-base">৳{(totalPrice() + 120).toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-body mt-1">Exact amount will be calculated at checkout based on your location</p>
                  </div>

                  <Link
                    to="/checkout"
                    className="flex items-center justify-center gap-2 w-full mt-6 bg-foreground text-background py-4 font-display font-semibold text-sm tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    Proceed to Checkout
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
