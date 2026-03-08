import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCartStore } from "@/store/cartStore";
import { categoryImages, type Category } from "@/data/products";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

const Cart = () => {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore();

  const getImage = (item: typeof items[0]) => {
    const url = item.product.image_url;
    return url && url !== "/placeholder.svg" ? url : categoryImages[item.product.category as Category] || "/placeholder.svg";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-8">Shopping Cart</h1>
          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Link to="/products" className="inline-block bg-foreground text-background px-8 py-3 font-display font-semibold text-sm tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors">Continue Shopping</Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
              <div className="lg:col-span-2 space-y-0 divide-y divide-border">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex gap-4 py-6 first:pt-0">
                    <Link to={`/product/${item.product.id}`} className="w-20 h-28 md:w-24 md:h-32 bg-secondary shrink-0 overflow-hidden">
                      <img src={getImage(item)} alt={item.product.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product.id}`} className="font-display font-medium text-sm hover:underline line-clamp-1">{item.product.name}</Link>
                      <p className="text-xs text-muted-foreground mt-1">Size: {item.size}</p>
                      <p className="font-display font-semibold text-sm mt-2">৳{item.product.price.toLocaleString()}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border border-border">
                          <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)} className="p-1.5 hover:bg-secondary transition-colors"><Minus size={14} /></button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)} className="p-1.5 hover:bg-secondary transition-colors"><Plus size={14} /></button>
                        </div>
                        <button onClick={() => removeItem(item.product.id, item.size)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div className="font-display font-semibold text-sm shrink-0">৳{(item.product.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="bg-secondary/50 p-6 sticky top-24">
                  <h2 className="font-display font-semibold text-lg mb-6">Order Summary</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">৳{totalPrice().toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="text-muted-foreground">Calculated at checkout</span></div>
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="font-display font-semibold">Total</span>
                      <span className="font-display font-bold text-lg">৳{totalPrice().toLocaleString()}</span>
                    </div>
                  </div>
                  <Link to="/checkout" className="block w-full text-center mt-6 bg-foreground text-background py-3.5 font-display font-semibold text-sm tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors">Proceed to Checkout</Link>
                  <Link to="/products" className="block text-center mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors">Continue Shopping</Link>
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
