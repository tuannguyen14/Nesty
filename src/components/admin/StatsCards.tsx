'use client'

import { ProductWithDetails } from '@/types/product';
import { Package, Layers, Archive, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';

interface StatsCardsProps {
  products: ProductWithDetails[];
}

export default function StatsCards({ products }: StatsCardsProps) {
  const totalProducts = products.length;
  const totalVariants = products.reduce((sum, product) => sum + product.variants.length, 0);
  const totalStock = products.reduce((sum, product) => 
    sum + product.variants.reduce((variantSum, variant) => variantSum + variant.stock, 0), 0
  );
  const discountedProducts = products.filter(product => 
    product.discount_price && product.discount_price > 0
  ).length;

  // Calculate percentages for visual indicators
  const discountPercentage = totalProducts > 0 ? Math.round((discountedProducts / totalProducts) * 100) : 0;
  const averageVariantsPerProduct = totalProducts > 0 ? (totalVariants / totalProducts).toFixed(1) : '0';

  const stats = [
    {
      title: 'Tổng sản phẩm',
      value: totalProducts.toLocaleString(),
      description: 'Sản phẩm đang bán',
      icon: Package,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      darkBgGradient: 'dark:from-blue-900/20 dark:to-blue-800/20',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Tổng biến thể',
      value: totalVariants.toLocaleString(),
      description: `~${averageVariantsPerProduct} biến thể/sản phẩm`,
      icon: Layers,
      gradient: 'from-emerald-500 to-green-600',
      bgGradient: 'from-emerald-50 to-green-100',
      darkBgGradient: 'dark:from-emerald-900/20 dark:to-green-800/20',
      change: '+5%',
      changeType: 'increase'
    },
    {
      title: 'Tổng tồn kho',
      value: totalStock.toLocaleString(),
      description: 'Sản phẩm trong kho',
      icon: Archive,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-100',
      darkBgGradient: 'dark:from-amber-900/20 dark:to-orange-800/20',
      change: '-3%',
      changeType: 'decrease'
    },
    {
      title: 'Đang giảm giá',
      value: discountedProducts.toLocaleString(),
      description: `${discountPercentage}% tổng sản phẩm`,
      icon: TrendingDown,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-100',
      darkBgGradient: 'dark:from-purple-900/20 dark:to-pink-800/20',
      change: '+18%',
      changeType: 'increase'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className={`
            relative overflow-hidden rounded-2xl p-6 
            bg-gradient-to-br ${stat.bgGradient} ${stat.darkBgGradient}
            border border-gray-200 dark:border-gray-700
            hover:shadow-lg transition-all duration-300 hover:-translate-y-1
            group cursor-pointer
          `}
        >
          {/* Background decoration */}
          <div className={`
            absolute -right-8 -top-8 h-32 w-32 rounded-full 
            bg-gradient-to-br ${stat.gradient} opacity-10
            group-hover:scale-110 transition-transform duration-300
          `} />
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div className={`
                inline-flex p-3 rounded-xl
                bg-gradient-to-br ${stat.gradient}
                text-white shadow-lg
                group-hover:scale-110 transition-transform duration-300
              `}>
                <stat.icon className="h-6 w-6" />
              </div>
              
              {/* Change indicator */}
              <div className={`
                flex items-center gap-1 text-sm font-medium
                ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}
              `}>
                {stat.changeType === 'increase' ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
            
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.title}
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {stat.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}