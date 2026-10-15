import type { Product } from '../data/products';
import { formatPrice, escapeHTML } from '../utils/helpers';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onAddToCart: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function ProductCard({ product, isFavorite, onAddToCart, onToggleFavorite }: ProductCardProps) {
  return (
    <article className="group relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-lg hover:border-gray-200 dark:hover:border-gray-700">
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-gray-800">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={product.image}
          alt={escapeHTML(product.imageAlt)}
          loading="lazy"
        />
        <span className="absolute top-3 left-3 text-xs font-medium px-2 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-gray-900 dark:text-gray-100">
          {escapeHTML(product.badge)}
        </span>
        <button
          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isFavorite ? 'text-red-500' : ''}`}
          onClick={() => onToggleFavorite(product.id)}
          aria-label={isFavorite ? `Remove ${escapeHTML(product.name)} from favorites` : `Add ${escapeHTML(product.name)} to favorites`}
          aria-pressed={isFavorite}
        >
          {isFavorite ? (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
          )}
        </button>
        <button
          className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] px-4 py-2 bg-black text-white text-sm font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-900"
          onClick={() => onAddToCart(product.id)}
          aria-label={`Add ${escapeHTML(product.name)} to bag`}
        >
          Add to bag
        </button>
      </div>
      <div className="p-4">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {escapeHTML(product.category)}
        </span>
        <div className="flex items-baseline justify-between gap-2 mt-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
            {escapeHTML(product.name)}
          </h3>
          <span className="text-base font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
            {formatPrice(product.price)}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {escapeHTML(product.description)}
        </p>
      </div>
    </article>
  );
}