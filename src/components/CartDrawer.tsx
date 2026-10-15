import type { Product } from '../data/products';
import { formatPrice } from '../utils/helpers';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  cartCount: number;
  onUpdateQuantity: (productId: string, change: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  subtotal,
  cartCount,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-950 z-50 shadow-xl transform transition-transform duration-300 ease-in-out"
        id="cart-drawer"
        aria-labelledby="cart-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              YOUR EVERYDAY EDIT
            </span>
            <h2 id="cart-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Your bag <span className="text-gray-500 dark:text-gray-400 font-normal">({cartCount})</span>
            </h2>
          </div>
          <button
            type="button"
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onClose}
            aria-label="Close bag"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100%-120px)] px-6 text-center">
            <span className="text-4xl" aria-hidden="true">✳</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              A little room for good things.
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Your bag is waiting for its first find.
            </p>
            <button
              type="button"
              className="mt-6 w-full px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              Explore the edit
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-y-auto flex-1 px-4 py-4">
              <ul className="space-y-4" role="list" aria-label="Cart items">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex gap-4">
                    <img
                      src={product.image}
                      alt=""
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatPrice(product.price)}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, -1)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                            aria-label={`Remove one ${product.name}`}
                          >
                            −
                          </button>
                          <span className="px-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, 1)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                            aria-label={`Add one ${product.name}`}
                          >
                            +
                          </button>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {formatPrice(product.price * quantity)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(product.id)}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 whitespace-nowrap"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <strong className="text-gray-900 dark:text-gray-100">
                  {formatPrice(subtotal)}
                </strong>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Shipping and taxes calculated at checkout.
              </p>
              <button
                type="button"
                className="w-full px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                onClick={onCheckout}
              >
                Continue to checkout
              </button>
              <button
                type="button"
                className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline underline-offset-2"
                onClick={onClose}
              >
                Keep looking around
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}