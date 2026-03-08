import catTshirt from "@/assets/cat-tshirt.jpg";
import catPanjabi from "@/assets/cat-panjabi.jpg";
import catPolo from "@/assets/cat-polo.jpg";
import catPants from "@/assets/cat-pants.jpg";
import catTrousers from "@/assets/cat-trousers.jpg";

export type Category = "t-shirts" | "panjabi" | "polo-shirts" | "pants" | "trousers";
export type Size = "S" | "M" | "L" | "XL" | "XXL";

export const categories: { slug: Category; name: string; image: string; description: string }[] = [
  { slug: "t-shirts", name: "T-Shirts", image: catTshirt, description: "Half & Full Sleeve" },
  { slug: "panjabi", name: "Panjabi", image: catPanjabi, description: "Traditional & Slim Fit" },
  { slug: "polo-shirts", name: "Polo Shirts", image: catPolo, description: "Premium Collared" },
  { slug: "pants", name: "Pants", image: catPants, description: "Denim, Gabardine & Formal" },
  { slug: "trousers", name: "Trousers", image: catTrousers, description: "Casual & Activewear" },
];

// Category images map for fallback when product has no image
export const categoryImages: Record<Category, string> = {
  "t-shirts": catTshirt,
  panjabi: catPanjabi,
  "polo-shirts": catPolo,
  pants: catPants,
  trousers: catTrousers,
};
