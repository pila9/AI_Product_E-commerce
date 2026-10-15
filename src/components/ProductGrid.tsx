import type { Product } from '../data/products';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  favorites: Set<string>;
  onAddToCart: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function ProductGrid({ products, favorites, onAddToCart, onToggleFavorite }: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      id="product-grid"
      role="list"
      aria-label="Products"
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isFavorite={favorites.has(product.id)}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}