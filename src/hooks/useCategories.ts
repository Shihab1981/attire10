import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { categories as defaultCategories } from "@/data/products";

export type CategoryItem = {
  slug: string;
  name: string;
  image: string;
  description: string;
};

export const useCategories = () => {
  const { data: customImages = {} } = useQuery({
    queryKey: ["category-images"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "category_images")
        .single();
      return data?.value ? JSON.parse(data.value) : {};
    },
  });

  const { data: customizations = {} } = useQuery({
    queryKey: ["category-customizations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "category_customizations")
        .single();
      return data?.value ? JSON.parse(data.value) : {};
    },
  });

  const { data: extraCategories = [] } = useQuery({
    queryKey: ["extra-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "extra_categories")
        .single();
      return data?.value ? JSON.parse(data.value) : [];
    },
  });

  // Merge default + extra categories with customizations applied
  const allCategories: CategoryItem[] = [
    ...defaultCategories.map((cat) => ({
      slug: cat.slug,
      name: customizations[cat.slug]?.name || cat.name,
      image: customImages[cat.slug] || cat.image,
      description: customizations[cat.slug]?.description || cat.description,
    })),
    ...extraCategories.map((cat: CategoryItem) => ({
      slug: cat.slug,
      name: customizations[cat.slug]?.name || cat.name,
      image: customImages[cat.slug] || cat.image,
      description: customizations[cat.slug]?.description || cat.description,
    })),
  ];

  // Just the slug list for dropdowns
  const categorySlugs = allCategories.map((c) => c.slug);

  return { categories: allCategories, categorySlugs, extraCategories };
};
