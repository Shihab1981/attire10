import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminCoupons from "./pages/AdminCoupons";
import AdminFlashSales from "./pages/AdminFlashSales";
import AdminHeroSlides from "./pages/AdminHeroSlides";
import AdminReviews from "./pages/AdminReviews";
import AdminAuthGate from "./components/AdminAuthGate";
import OrderConfirmation from "./pages/OrderConfirmation";
import TrackOrder from "./pages/TrackOrder";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import Offline from "./pages/Offline";
import Install from "./pages/Install";
import OfflineIndicator from "./components/OfflineIndicator";
import InstallBanner from "./components/InstallBanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <OfflineIndicator />
        <InstallBanner />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/admin" element={<AdminAuthGate><AdminDashboard /></AdminAuthGate>} />
          <Route path="/admin/products" element={<AdminAuthGate><AdminProducts /></AdminAuthGate>} />
          <Route path="/admin/orders" element={<AdminAuthGate><AdminOrders /></AdminAuthGate>} />
          <Route path="/admin/coupons" element={<AdminAuthGate><AdminCoupons /></AdminAuthGate>} />
          <Route path="/admin/flash-sales" element={<AdminAuthGate><AdminFlashSales /></AdminAuthGate>} />
          <Route path="/admin/reviews" element={<AdminAuthGate><AdminReviews /></AdminAuthGate>} />
          <Route path="/admin/hero-slides" element={<AdminAuthGate><AdminHeroSlides /></AdminAuthGate>} />
          <Route path="/offline" element={<Offline />} />
          <Route path="/install" element={<Install />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
