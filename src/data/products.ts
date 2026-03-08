import catTshirt from "@/assets/cat-tshirt.jpg";
import catPanjabi from "@/assets/cat-panjabi.jpg";
import catPolo from "@/assets/cat-polo.jpg";
import catPants from "@/assets/cat-pants.jpg";
import catTrousers from "@/assets/cat-trousers.jpg";

export type Category = "t-shirts" | "panjabi" | "polo-shirts" | "pants" | "trousers";
export type SubCategory = string;
export type Size = "S" | "M" | "L" | "XL" | "XXL";

export interface Product {
  id: string;
  name: string;
  category: Category;
  subCategory: SubCategory;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  sizes: Size[];
  fabric: string;
  description: string;
  trending?: boolean;
  newArrival?: boolean;
  inStock: boolean;
}

export const categories: { slug: Category; name: string; image: string; description: string }[] = [
  { slug: "t-shirts", name: "T-Shirts", image: catTshirt, description: "Half & Full Sleeve" },
  { slug: "panjabi", name: "Panjabi", image: catPanjabi, description: "Traditional & Slim Fit" },
  { slug: "polo-shirts", name: "Polo Shirts", image: catPolo, description: "Premium Collared" },
  { slug: "pants", name: "Pants", image: catPants, description: "Denim, Gabardine & Formal" },
  { slug: "trousers", name: "Trousers", image: catTrousers, description: "Casual & Activewear" },
];

export const products: Product[] = [
  {
    id: "ts-01",
    name: "Essential Crew Neck Tee",
    category: "t-shirts",
    subCategory: "Half Sleeve",
    price: 1290,
    image: catTshirt,
    images: [catTshirt],
    sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "100% Premium Cotton, 180 GSM",
    description: "A wardrobe essential crafted from premium combed cotton. Features a relaxed fit with reinforced collar and double-stitched hems.",
    trending: true,
    newArrival: true,
    inStock: true,
  },
  {
    id: "ts-02",
    name: "Oversized Drop Shoulder Tee",
    category: "t-shirts",
    subCategory: "Half Sleeve",
    price: 1490,
    originalPrice: 1790,
    image: catTshirt,
    images: [catTshirt],
    sizes: ["M", "L", "XL", "XXL"],
    fabric: "Cotton-Lycra Blend, 200 GSM",
    description: "Contemporary oversized silhouette with drop shoulders. Pre-shrunk fabric ensures lasting fit wash after wash.",
    trending: true,
    inStock: true,
  },
  {
    id: "ts-03",
    name: "Full Sleeve Henley",
    category: "t-shirts",
    subCategory: "Full Sleeve",
    price: 1690,
    image: catTshirt,
    images: [catTshirt],
    sizes: ["S", "M", "L", "XL"],
    fabric: "100% Organic Cotton, 190 GSM",
    description: "Classic henley neckline with a modern twist. Three-button placket, ribbed cuffs, and a tailored fit.",
    newArrival: true,
    inStock: true,
  },
  {
    id: "pj-01",
    name: "Classic Navy Panjabi",
    category: "panjabi",
    subCategory: "Traditional",
    price: 2990,
    image: catPanjabi,
    images: [catPanjabi],
    sizes: ["M", "L", "XL", "XXL"],
    fabric: "Premium Cotton Silk Blend",
    description: "Timeless traditional panjabi with intricate embroidery on the chest. Perfect for festive occasions and formal gatherings.",
    trending: true,
    newArrival: true,
    inStock: true,
  },
  {
    id: "pj-02",
    name: "Slim Fit White Panjabi",
    category: "panjabi",
    subCategory: "Slim Fit",
    price: 2490,
    image: catPanjabi,
    images: [catPanjabi],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Pure Muslin Cotton",
    description: "A modern slim-fit panjabi in crisp white. Minimalist design with subtle tonal embroidery at the collar.",
    inStock: true,
  },
  {
    id: "pl-01",
    name: "Premium Piqué Polo",
    category: "polo-shirts",
    subCategory: "Premium",
    price: 1890,
    image: catPolo,
    images: [catPolo],
    sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "100% Piqué Cotton, 220 GSM",
    description: "Elevated polo shirt crafted from heavyweight piqué cotton. Features a ribbed collar, two-button placket, and side vents.",
    trending: true,
    inStock: true,
  },
  {
    id: "pl-02",
    name: "Contrast Trim Polo",
    category: "polo-shirts",
    subCategory: "Premium",
    price: 1990,
    originalPrice: 2490,
    image: catPolo,
    images: [catPolo],
    sizes: ["M", "L", "XL"],
    fabric: "Cotton-Elastane Blend",
    description: "Sport-luxe polo with contrast tipping on collar and cuffs. Stretch fabric for comfort and movement.",
    newArrival: true,
    inStock: true,
  },
  {
    id: "pt-01",
    name: "Slim Fit Dark Denim",
    category: "pants",
    subCategory: "Denim",
    price: 2490,
    image: catPants,
    images: [catPants],
    sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "12oz Japanese Selvedge Denim",
    description: "Premium slim-fit denim crafted from Japanese selvedge fabric. Raw indigo wash with subtle whiskering.",
    trending: true,
    inStock: true,
  },
  {
    id: "pt-02",
    name: "Gabardine Formal Pant",
    category: "pants",
    subCategory: "Gabardine",
    price: 2290,
    image: catPants,
    images: [catPants],
    sizes: ["M", "L", "XL", "XXL"],
    fabric: "Wool-Blend Gabardine",
    description: "Tailored formal pants in fine gabardine. Features a pressed crease, hook-and-bar closure, and adjustable waist tabs.",
    inStock: true,
  },
  {
    id: "pt-03",
    name: "Classic Formal Trouser",
    category: "pants",
    subCategory: "Formal",
    price: 2190,
    image: catPants,
    images: [catPants],
    sizes: ["S", "M", "L", "XL"],
    fabric: "Polyester-Viscose Blend",
    description: "Essential formal trouser with a regular fit. Wrinkle-resistant fabric ideal for office and formal occasions.",
    newArrival: true,
    inStock: true,
  },
  {
    id: "tr-01",
    name: "Relaxed Chino Trouser",
    category: "trousers",
    subCategory: "Casual",
    price: 1990,
    image: catTrousers,
    images: [catTrousers],
    sizes: ["S", "M", "L", "XL", "XXL"],
    fabric: "100% Brushed Cotton Twill",
    description: "Laid-back chinos with a relaxed tapered fit. Garment-dyed for a rich, lived-in colour. Features slash pockets and a button fly.",
    trending: true,
    inStock: true,
  },
  {
    id: "tr-02",
    name: "Performance Jogger",
    category: "trousers",
    subCategory: "Activewear",
    price: 1790,
    originalPrice: 2190,
    image: catTrousers,
    images: [catTrousers],
    sizes: ["M", "L", "XL"],
    fabric: "Quick-Dry Polyester-Spandex",
    description: "Athleisure joggers with moisture-wicking technology. Elastic waistband with drawstring, zippered pockets, and ribbed cuffs.",
    newArrival: true,
    inStock: true,
  },
];
