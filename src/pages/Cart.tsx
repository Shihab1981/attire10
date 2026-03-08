import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCartStore } from "@/store/cartStore";
import { categoryImages, type Category } from "@/data/products";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Package, Shield, Truck, Tag } from "lucide-react";
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
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 md:mb-14"
          >
            <div className="flex items-end justify-between pb-6 border-b border-border">
              <div>
                <div className="h-[2px] w-8 bg-accent mb-4" />
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-2">Shopping</p>
                <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">Your Cart</h1>
              </div>
              {items.length > 0 && (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 bg-secondary px-3 py-1.5 text-xs font-body font-medium">
                    <ShoppingBag size={13} />
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-24"
            >
              <div className="w-24 h-24 mx-auto mb-8 bg-secondary/60 rounded-full flex items-center justify-center">
                <ShoppingBag size={32} className="text-muted-foreground" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-3">Your cart is empty</h2>
              <p className="text-muted-foreground text-sm font-body mb-10 max-w-sm mx-auto leading-relaxed">
                Looks like you haven't added anything yet. Explore our collection to find something you love.
              </p>
              <Link
                to="/products"
                className="shimmer-btn inline-flex items-center gap-2 px-10 py-4 text-accent-foreground font-display font-semibold text-sm tracking-wide"
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
                      key={`${item.product.id}-${item.size}-${item.color || ""}`}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -80, transition: { duration: 0.3 } }}
                      transition={{ delay: index * 0.06 }}
                      className="md:grid md:grid-cols-12 md:gap-4 md:items-center py-6 border-b border-border group/item hover:bg-secondary/20 transition-colors -mx-4 px-4 md:-mx-6 md:px-6"
                    >
                      {/* Product Info */}
                      <div className="md:col-span-6 flex gap-4">
                        <Link
                          to={`/product/${item.product.id}`}
                          className="w-20 h-28 md:w-24 md:h-32 bg-secondary shrink-0 overflow-hidden group relative"
                        >
                          <img
                            src={getImage(item)}
                            alt={item.product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent transition-all duration-500 group-hover:w-full" />
                        </Link>
                        <div className="flex flex-col justify-center min-w-0">
                          <Link
                            to={`/product/${item.product.id}`}
                            className="font-display font-bold text-sm md:text-base hover:text-accent transition-colors line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body bg-secondary/60 px-2 py-0.5">
                              Size: {item.size}
                            </span>
                            {item.color && (
                              <span className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground font-body bg-secondary/60 px-2 py-0.5 flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded-full border border-border inline-block" style={{ backgroundColor: item.color }} />
                                Color
                              </span>
                            )}
                          </div>
                          <p className="md:hidden font-body font-bold text-sm mt-2">
                            ৳{item.product.price.toLocaleString()}
                          </p>
                          <button
                            onClick={() => removeItem(item.product.id, item.size, item.color)}
                            className="mt-2.5 text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-destructive transition-colors font-body flex items-center gap-1 w-fit opacity-0 group-hover/item:opacity-100 md:opacity-100"
                          >
                            <X size={12} />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2 flex md:justify-center mt-4 md:mt-0">
                        <div className="flex items-center border border-border overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1, item.color)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-secondary transition-colors active:scale-95"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-10 text-center text-sm font-display font-bold bg-secondary/30">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1, item.color)}
                            className="w-9 h-9 flex items-center justify-center hover:bg-secondary transition-colors active:scale-95"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="hidden md:flex md:col-span-2 justify-center">
                        <span className="font-body text-sm text-muted-foreground">৳{item.product.price.toLocaleString()}</span>
                      </div>

                      {/* Line Total */}
                      <div className="hidden md:flex md:col-span-2 justify-end">
                        <span className="font-display font-bold text-sm">
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-5 xl:col-span-4"
              >
                <div className="sticky top-24 border border-border overflow-hidden">
                  {/* Summary Header */}
                  <div className="bg-foreground text-primary-foreground px-6 md:px-8 py-5">
                    <h2 className="font-display font-bold text-lg tracking-wide">Order Summary</h2>
                  </div>

                  <div className="p-6 md:p-8 bg-background">
                    <div className="space-y-4 text-sm font-body">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                        <span className="font-semibold">৳{totalPrice().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Truck size={14} className="text-accent" />
                          Inside Dhaka
                        </span>
                        <span>৳60</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Truck size={14} />
                          Outside Dhaka
                        </span>
                        <span>৳120</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="section-divider my-6" />

                    {/* Due amounts */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground font-body">Due (Inside Dhaka)</span>
                        <span className="font-display font-extrabold text-lg">৳{(totalPrice() + 60).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm text-muted-foreground font-body">Due (Outside Dhaka)</span>
                        <span className="font-display font-extrabold text-lg">৳{(totalPrice() + 120).toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-body mt-2 leading-relaxed">
                        Exact amount will be calculated at checkout based on your location
                      </p>
                    </div>

                    {/* CTA */}
                    <Link
                      to="/checkout"
                      className="shimmer-btn flex items-center justify-center gap-2 w-full mt-8 py-4 text-accent-foreground font-display font-bold text-sm tracking-wide hover:shadow-lg hover:shadow-accent/20 transition-shadow active:scale-[0.98]"
                    >
                      Proceed to Checkout
                      <ArrowRight size={16} />
                    </Link>

                    {/* Trust signals */}
                    <div className="mt-6 pt-5 border-t border-border/50 grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-body">
                        <Shield size={14} className="text-accent shrink-0" />
                        Secure Checkout
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-body">
                        <Tag size={14} className="text-accent shrink-0" />
                        Best Price
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-body">
                        <Truck size={14} className="text-accent shrink-0" />
                        Fast Delivery
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-body">
                        <Package size={14} className="text-accent shrink-0" />
                        Easy Returns
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
