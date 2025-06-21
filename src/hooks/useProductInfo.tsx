import { useMemo } from 'react';
import { ProductWithRelations } from '@/types/product';

export function useProductInfo(product: ProductWithRelations) {
  return useMemo(() => {
    const variants = product.product_variants || [];
    const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
    const availableColors = [...new Set(variants.map(v => v.color))];
    const availableSizes = [...new Set(variants.map(v => v.size))];

    return { totalStock, availableColors, availableSizes };
  }, [product.product_variants]);
}