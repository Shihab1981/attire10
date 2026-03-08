import { useCallback } from "react";
import QRCode from "qrcode";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;
type OrderItem = Tables<"order_items">;

const TRACK_BASE_URL = window.location.origin + "/track-order?id=";

export const useOrderCardDownload = () => {
  const downloadCard = useCallback(
    async (order: Order, items: OrderItem[], estimatedDelivery: string) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const W = 900;
      const padding = 48;
      const lineH = 28;

      // Generate QR code as data URL
      const trackUrl = `${TRACK_BASE_URL}${order.id}`;
      const qrDataUrl = await QRCode.toDataURL(trackUrl, {
        width: 120,
        margin: 1,
        color: { dark: "#1C1917", light: "#FAF8F500" },
      });

      // Calculate height dynamically
      const itemsHeight = items.length * lineH + 20;
      const H = 700 + itemsHeight;
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

      // ── HEADER: Logo text + icon ──
      // Draw a stylized logo box
      ctx.fillStyle = "#1C1917";
      ctx.fillRect(padding, y - 24, 44, 44);
      ctx.font = "800 22px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#FAF8F5";
      ctx.textAlign = "center";
      ctx.fillText("A", padding + 22, y + 4);
      ctx.textAlign = "left";

      // Brand name
      drawText("ATTIRE", padding + 56, y, { size: 28, weight: "800", color: "#1C1917" });
      drawText("Premium Clothing", padding + 56, y + 18, { size: 10, weight: "500", color: "#A8A29E" });

      // Receipt label on right
      drawText("ORDER RECEIPT", W - padding, y - 6, { size: 10, weight: "700", color: "#A8A29E", align: "right" });
      drawText(`#${order.id.slice(0, 8).toUpperCase()}`, W - padding, y + 10, { size: 14, weight: "700", align: "right" });

      y += 38;
      drawLine(y);
      y += 30;

      // Order ID & Date row
      drawText("Order Date", padding, y, { size: 10, weight: "600", color: "#A8A29E" });
      drawText("Status", W / 2 + 40, y, { size: 10, weight: "600", color: "#A8A29E" });
      y += 22;
      const dateStr = new Date(order.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      drawText(dateStr, padding, y, { size: 14, weight: "500" });

      // Status badge
      const statusColors: Record<string, { bg: string; text: string }> = {
        pending: { bg: "#FEF3C7", text: "#92400E" },
        shipped: { bg: "#DBEAFE", text: "#1E40AF" },
        delivered: { bg: "#D1FAE5", text: "#065F46" },
        cancelled: { bg: "#FEE2E2", text: "#991B1B" },
      };
      const sc = statusColors[order.status] || statusColors.pending;
      const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
      ctx.fillStyle = sc.bg;
      const statusW = ctx.measureText(statusText).width + 24;
      ctx.fillRect(W / 2 + 40, y - 14, statusW, 22);
      drawText(statusText, W / 2 + 52, y, { size: 11, weight: "600", color: sc.text });

      y += 18;
      drawLine(y);
      y += 28;

      // Customer Info
      drawText("CUSTOMER DETAILS", padding, y, { size: 10, weight: "600", color: "#A8A29E" });
      y += 24;
      drawText(order.customer_name, padding, y, { size: 15, weight: "600" });
      y += 22;
      drawText(`📞  ${order.customer_phone}`, padding, y, { size: 13, color: "#78716C" });
      y += 22;

      const maxAddrLen = 75;
      const addr =
        order.customer_address.length > maxAddrLen
          ? order.customer_address.slice(0, maxAddrLen) + "..."
          : order.customer_address;
      drawText(`📍  ${addr}`, padding, y, { size: 13, color: "#78716C" });

      y += 14;
      drawLine(y);
      y += 28;

      // Estimated Delivery
      if (estimatedDelivery) {
        ctx.fillStyle = "#FFF7ED";
        const boxW = W - padding * 2;
        ctx.fillRect(padding, y - 14, boxW, 44);
        ctx.strokeStyle = "#FDBA74";
        ctx.lineWidth = 1;
        ctx.strokeRect(padding, y - 14, boxW, 44);
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

      y += 44;

      // ── QR CODE + Footer Section ──
      drawLine(y - 10);
      y += 16;

      // QR code on the left
      const qrSize = 100;
      const qrImg = new Image();
      qrImg.onload = () => {
        ctx.drawImage(qrImg, padding, y - 4, qrSize, qrSize);

        // Text next to QR
        drawText("Scan to Track Order", padding + qrSize + 16, y + 16, { size: 13, weight: "600" });
        drawText("Scan this QR code to track your", padding + qrSize + 16, y + 36, { size: 11, color: "#78716C" });
        drawText("order status in real-time.", padding + qrSize + 16, y + 52, { size: 11, color: "#78716C" });
        drawText(trackUrl.length > 55 ? trackUrl.slice(0, 55) + "..." : trackUrl, padding + qrSize + 16, y + 72, {
          size: 9,
          color: "#A8A29E",
        });

        // Payment method badge on right
        ctx.fillStyle = "#F5F5F4";
        ctx.fillRect(W - padding - 160, y, 160, 36);
        drawText("💵 Cash on Delivery", W - padding - 80, y + 22, { size: 11, weight: "600", color: "#57534E", align: "center" });

        y += qrSize + 20;

        // Final footer
        drawText("Thank you for shopping with ATTIRE!", W / 2, y, {
          size: 12,
          weight: "500",
          color: "#A8A29E",
          align: "center",
        });

        // Resize canvas to actual content height
        const finalH = y + 30;
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = W;
        tempCanvas.height = finalH;
        const tempCtx = tempCanvas.getContext("2d")!;
        tempCtx.drawImage(canvas, 0, 0);

        // Download
        const link = document.createElement("a");
        link.download = `ATTIRE-Order-${order.id.slice(0, 8).toUpperCase()}.png`;
        link.href = tempCanvas.toDataURL("image/png");
        link.click();
      };
      qrImg.src = qrDataUrl;
    },
    []
  );

  return { downloadCard };
};
