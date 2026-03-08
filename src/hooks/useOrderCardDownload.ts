import { useCallback } from "react";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;
type OrderItem = Tables<"order_items">;

export const useOrderCardDownload = () => {
  const downloadCard = useCallback(
    (order: Order, items: OrderItem[], estimatedDelivery: string) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const W = 900;
      const padding = 48;
      const lineH = 28;

      // Calculate height dynamically
      const itemsHeight = items.length * lineH + 20;
      const H = 620 + itemsHeight;
      canvas.width = W;
      canvas.height = H;

      // Background
      ctx.fillStyle = "#FAF8F5";
      ctx.fillRect(0, 0, W, H);

      // Top accent bar
      ctx.fillStyle = "#D97706";
      ctx.fillRect(0, 0, W, 6);

      // Helper functions
      const drawText = (
        text: string,
        x: number,
        y: number,
        opts: { size?: number; weight?: string; color?: string; align?: CanvasTextAlign } = {}
      ) => {
        const { size = 14, weight = "400", color = "#1C1917", align = "left" } = opts;
        ctx.font = `${weight} ${size}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.fillText(text, x, y);
      };

      const drawLine = (y: number) => {
        ctx.strokeStyle = "#E7E5E4";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(W - padding, y);
        ctx.stroke();
      };

      let y = 50;

      // Store name & receipt label
      drawText("ATTIRE", padding, y, { size: 28, weight: "800", color: "#1C1917" });
      drawText("ORDER RECEIPT", W - padding, y, { size: 11, weight: "600", color: "#A8A29E", align: "right" });

      y += 18;
      drawLine(y);
      y += 30;

      // Order ID & Date
      drawText("Order ID", padding, y, { size: 10, weight: "600", color: "#A8A29E" });
      drawText("Date", W / 2 + 40, y, { size: 10, weight: "600", color: "#A8A29E" });
      y += 22;
      drawText(`#${order.id.slice(0, 8).toUpperCase()}`, padding, y, { size: 16, weight: "700" });
      const dateStr = new Date(order.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      drawText(dateStr, W / 2 + 40, y, { size: 14 });

      y += 18;
      drawLine(y);
      y += 28;

      // Customer Info
      drawText("CUSTOMER DETAILS", padding, y, { size: 10, weight: "600", color: "#A8A29E" });
      y += 24;
      drawText(order.customer_name, padding, y, { size: 15, weight: "600" });
      y += 22;
      drawText(order.customer_phone, padding, y, { size: 13, color: "#78716C" });
      y += 22;

      // Truncate address if too long
      const maxAddrLen = 80;
      const addr =
        order.customer_address.length > maxAddrLen
          ? order.customer_address.slice(0, maxAddrLen) + "..."
          : order.customer_address;
      drawText(addr, padding, y, { size: 13, color: "#78716C" });

      y += 14;
      drawLine(y);
      y += 28;

      // Estimated Delivery
      if (estimatedDelivery) {
        ctx.fillStyle = "#FFF7ED";
        ctx.fillRect(padding, y - 14, W - padding * 2, 44);
        ctx.strokeStyle = "#FDBA74";
        ctx.lineWidth = 1;
        ctx.strokeRect(padding, y - 14, W - padding * 2, 44);
        drawText("📦 Estimated Delivery:", padding + 14, y + 8, { size: 12, weight: "600", color: "#92400E" });
        drawText(estimatedDelivery, padding + 200, y + 8, { size: 12, color: "#92400E" });
        y += 50;
      }

      // Items header
      drawText("PRODUCT", padding, y, { size: 10, weight: "600", color: "#A8A29E" });
      drawText("SIZE", W - 280, y, { size: 10, weight: "600", color: "#A8A29E" });
      drawText("QTY", W - 190, y, { size: 10, weight: "600", color: "#A8A29E" });
      drawText("PRICE", W - padding, y, { size: 10, weight: "600", color: "#A8A29E", align: "right" });

      y += 8;
      drawLine(y);
      y += 24;

      // Items
      items.forEach((item) => {
        const name = item.product_name.length > 35 ? item.product_name.slice(0, 35) + "..." : item.product_name;
        drawText(name, padding, y, { size: 13, weight: "500" });
        drawText(item.size, W - 280, y, { size: 13, color: "#78716C" });
        drawText(`×${item.quantity}`, W - 190, y, { size: 13, color: "#78716C" });
        drawText(`৳${(item.price * item.quantity).toLocaleString()}`, W - padding, y, {
          size: 13,
          weight: "600",
          align: "right",
        });
        y += lineH;
      });

      y += 4;
      drawLine(y);
      y += 28;

      // Summary
      const summaryX = W - 280;
      drawText("Subtotal", summaryX, y, { size: 13, color: "#78716C" });
      drawText(`৳${order.subtotal.toLocaleString()}`, W - padding, y, { size: 13, align: "right" });
      y += 24;

      if (order.discount > 0) {
        drawText(`Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}`, summaryX, y, {
          size: 13,
          color: "#D97706",
        });
        drawText(`-৳${order.discount.toLocaleString()}`, W - padding, y, {
          size: 13,
          color: "#D97706",
          align: "right",
        });
        y += 24;
      }

      const shipping = order.total_price - order.subtotal + order.discount;
      if (shipping > 0) {
        drawText("Shipping", summaryX, y, { size: 13, color: "#78716C" });
        drawText(`৳${shipping.toLocaleString()}`, W - padding, y, { size: 13, align: "right" });
        y += 24;
      }

      drawLine(y - 6);
      y += 18;

      drawText("Total", summaryX, y, { size: 16, weight: "700" });
      drawText(`৳${order.total_price.toLocaleString()}`, W - padding, y, {
        size: 18,
        weight: "800",
        align: "right",
      });

      y += 36;

      // Footer
      drawText("Cash on Delivery (COD)", W / 2, y, { size: 11, color: "#A8A29E", align: "center" });
      y += 18;
      drawText("Thank you for shopping with ATTIRE!", W / 2, y, {
        size: 11,
        weight: "500",
        color: "#A8A29E",
        align: "center",
      });

      // Download
      const link = document.createElement("a");
      link.download = `ATTIRE-Order-${order.id.slice(0, 8).toUpperCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    },
    []
  );

  return { downloadCard };
};
