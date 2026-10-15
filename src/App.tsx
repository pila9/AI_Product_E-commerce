import { useState, useEffect, useCallback } from 'react';
import { products, categories, type Category, type SortOption, sortOptions } from './data/products';
import { ProductGrid } from './components/ProductGrid';
import { Header } from './components/Header';
import { DiscoveryPanel } from './components/DiscoveryPanel';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutDialog } from './components/CheckoutDialog';
import { Toast } from './components/Toast';
import { useCart, useFavorites, useRecommendations } from './hooks/useStore';

function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  });

  const {
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartItems,
    getCartCount,
    getSubtotal,
  } = useCart();

  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const {
    activeEdit,
    activeQuery,
    isLoading,
    error,
    requestEdit,
    clearEdit,
  } = useRecommendations();

  const cartItems = getCartItems(products);
  const cartCount = getCartCount();
  const subtotal = getSubtotal(products);

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
  }, []);

  const handleAddToCart = useCallback(
    (productId: string) => {
      addToCart(productId);
      const product = products.find((p) => p.id === productId);
      if (product) showToast(`${product.name} added to your bag.`);
    },
    [addToCart, products, showToast]
  );

  const handleToggleFavorite = useCallback(
    (productId: string) => {
      toggleFavorite(productId);
      showToast(isFavorite(productId) ? 'Removed from your favorites.' : 'Saved to your favorites.');
    },
    [toggleFavorite, isFavorite, showToast]
  );

  const handleCategoryChange = useCallback((category: Category) => {
    setActiveCategory(category);
    clearEdit();
  }, [clearEdit]);

  const handleSearch = useCallback(
    (prompt: string) => {
      requestEdit(prompt);
    },
    [requestEdit]
  );

  const handleClearFilters = useCallback(() => {
    setActiveCategory('All');
    clearEdit();
  }, [clearEdit]);

  const handleSortChange = useCallback((value: SortOption) => {
    setSortBy(value);
  }, []);

  const matchingProducts = () => {
    const recommendedOrder = activeEdit
      ? new Map(activeEdit.productIds.map((id, index) => [id, index]))
      : null;

    let matches = products.filter((product) => {
      if (activeEdit && recommendedOrder) {
        return recommendedOrder.has(product.id) && (activeCategory === 'All' || product.category === activeCategory);
      }
      return activeCategory === 'All' || product.category === activeCategory;
    });

    switch (sortBy) {
      case 'price-low':
        matches.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        matches.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        matches.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
        if (recommendedOrder) {
          matches.sort((a, b) => (recommendedOrder.get(a.id) ?? 0) - (recommendedOrder.get(b.id) ?? 0));
        }
        break;
    }

    return matches;
  };

  const handleOpenCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const handleCloseCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const handleCheckout = useCallback(() => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, []);

  const handleCloseCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
  }, []);

  const handleFinishCheckout = useCallback(() => {
    clearCart();
    setIsCheckoutOpen(false);
    showToast('Demo order placed. Thanks for stopping by!');
  }, [clearCart, showToast]);

  const handleUpdateQuantity = useCallback(
    (productId: string, change: number) => {
      updateQuantity(productId, change);
    },
    [updateQuantity]
  );

  const handleRemoveItem = useCallback(
    (productId: string) => {
      removeFromCart(productId);
      showToast('Item removed from your bag.');
    },
    [removeFromCart, showToast]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        handleCloseCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, handleCloseCart]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <span className="block text-center text-sm text-gray-600 dark:text-gray-400 py-2">
          Considered things, for everyday living.
          <a href="#products" className="ml-2 text-purple-600 dark:text-purple-400 hover:underline flex items-center justify-center gap-1">
            Meet your new favorites
            <span aria-hidden="true">↗</span>
          </a>
        </span>
      </div>

      <Header
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        cartCount={cartCount}
        onCartOpen={handleOpenCart}
        onSearchFocus={() => {
          const input = document.getElementById('discovery-input');
          input?.focus();
          input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }}
      />

      <main className="flex-1">
        <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 overflow-hidden">
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-purple-200/30 dark:bg-purple-900/20 blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-300/20 dark:bg-purple-900/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full bg-amber-200/30 dark:bg-amber-900/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-full">
              <span aria-hidden="true">✳</span>
              A little more intentional
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-900 dark:text-gray-100 leading-tight">
              Good things,<br />
              <span className="text-gray-600 dark:text-gray-300">found for you.</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Thoughtful everyday finds, picked around the way you actually live.
            </p>
            <a
              href="#products"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white font-medium rounded-full hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 transition-colors"
            >
              Explore the edit
              <span aria-hidden="true">↘</span>
            </a>

            <div className="mt-12 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true">✳</span>
                <span>Curated with care.<br />Never complicated.</span>
              </span>
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-400 dark:text-gray-500">
              <span>01</span> / THE EVERYDAY EDIT
            </div>
          </div>
        </section>

        <section id="products" className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                A good place to start
              </span>
              <h2 className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
                Find your kind of good.
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Useful things, made a little more special.
              </p>
            </div>

            <DiscoveryPanel
              onSearch={handleSearch}
              isLoading={isLoading}
              error={error}
              activeQuery={activeQuery}
              activeEditSummary={activeEdit?.summary ?? null}
              onClear={handleClearFilters}
            />

            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter products by category">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                      activeCategory === category
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                    }`}
                    aria-pressed={activeCategory === category}
                  >
                    {category}
                    {category !== 'All' && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded-full">
                        {products.filter((p) => p.category === category).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  aria-label="Sort products"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <ProductGrid
              products={matchingProducts()}
              favorites={favorites}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
            />

            {matchingProducts().length === 0 && (
              <div className="text-center py-16" id="empty-state">
                <span className="text-4xl" aria-hidden="true">✳</span>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  No matches just yet
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Try another search or browse everything in the edit.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline underline-offset-2"
                >
                  Show me everything
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 px-4 bg-gray-50 dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800">
          <div className="max-w-2xl mx-auto text-center">
            <span className="text-2xl" aria-hidden="true">✳</span>
            <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              Fewer things. <span className="font-semibold">Better chosen.</span>
            </p>
            <a
              href="#products"
              className="mt-4 inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline underline-offset-2"
            >
              Find your next favorite
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="py-12 px-4 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <a href="#" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            morrow<span className="text-sm font-normal">®</span>
          </a>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Good things for the life you live.
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            Thoughtfully made for this little demo.
          </p>
        </div>
      </footer>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={handleCloseCart}
        items={cartItems}
        subtotal={subtotal}
        cartCount={cartCount}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        onConfirm={handleFinishCheckout}
        total={subtotal}
      />

      <Toast message={toast.message} isVisible={toast.visible} onClose={() => setToast({ ...toast, visible: false })} />
    </div>
  );
}

export default App;