import catSmartphones from "@/assets/cat-smartphones.jpg";
import catAudio from "@/assets/cat-audio.jpg";
import catSmartwatch from "@/assets/cat-smartwatch.jpg";
import catLaptops from "@/assets/cat-laptops.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catGaming from "@/assets/cat-gaming.jpg";

export type Category =
  | "smartphones"
  | "audio"
  | "smartwatches"
  | "laptops"
  | "accessories"
  | "gaming";

/** Product variant (storage / model option). Kept as a string for flexibility. */
export type Size = string;

/** Variant options used by filters across the store. */
export const allVariants: Size[] = ["Standard", "64GB", "128GB", "256GB", "512GB", "1TB"];

export const categories: { slug: Category; name: string; image: string; description: string }[] = [
  { slug: "smartphones", name: "Smartphones", image: catSmartphones, description: "Flagship & Budget Phones" },
  { slug: "audio", name: "Audio", image: catAudio, description: "Earbuds, Headphones & Speakers" },
  { slug: "smartwatches", name: "Smartwatches", image: catSmartwatch, description: "Fitness & Smart Bands" },
  { slug: "laptops", name: "Laptops", image: catLaptops, description: "Ultrabooks & Workstations" },
  { slug: "accessories", name: "Accessories", image: catAccessories, description: "Chargers, Cables & Power Banks" },
  { slug: "gaming", name: "Gaming", image: catGaming, description: "Keyboards, Mice & Consoles" },
];

// Category images map for fallback when product has no image
export const categoryImages: Record<Category, string> = {
  smartphones: catSmartphones,
  audio: catAudio,
  smartwatches: catSmartwatch,
  laptops: catLaptops,
  accessories: catAccessories,
  gaming: catGaming,
};
