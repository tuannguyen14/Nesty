import { useMemo } from 'react';
import { ProductWithRelations } from '@/types/product';

export function useProductInfo(product: ProductWithRelations) {
  return useMemo(() => {
    const variants = product.product_variants || [];
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    const availableColors = [...new Set(
      variants
        .map(v => v.color)
        .filter((color): color is string => color !== undefined && color !== null)
    )];
    const availableSizes = [...new Set(
      variants
        .map(v => v.size)
        .filter((size): size is string => size !== undefined && size !== null)
    )];

    return { totalStock, availableColors, availableSizes };
  }, [product.product_variants]);
}