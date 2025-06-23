import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ProductWithRelations } from "@/types/product";
import ProductDetailClient from "./ProductDetailClient";

// Server Component để fetch data
export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    // Await params trong server component
    const { slug } = await params;
    
    // Fetch product data từ Supabase
    const { data: product, error } = await supabase
        .from("products")
        .select(
            `
            *,
            categories:categories(*),
            product_images(*),
            product_variants(*)
            `
        )
        .eq("slug", slug)
        .single();
    
    if (error || !product) {
        notFound();
    }

    // Pass data to client component
    return <ProductDetailClient product={product as ProductWithRelations} />;
}