import { useState } from 'react';
import type { Category } from '../data/products';

interface HeaderProps {
  activeCategory: Category;
  onCategoryChange: (category: Category) => void;
  cartCount: number;
  onCartOpen: () => void;
  onSearchFocus: () => void;
}

const categories: Category[] = ['All', 'Home', 'Wellness', 'On the go'];

export function Header({
  activeCategory,
  onCategoryChange,
  cartCount,
  onCartOpen,
  onSearchFocus,
}: HeaderProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="text-xl font-semibold text-gray-900 dark:text-gray-100" aria-label="Morrow home">
            morrow<span className="text-sm font-normal">®</span>
          </a>

          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeCategory === category
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="md:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={() => setIsNavOpen(!isNavOpen)}
              aria-label="Open menu"
              aria-expanded={isNavOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {isNavOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <button
              type="button"
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={onSearchFocus}
              aria-label="Focus search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.8" strokeWidth="2" />
                <path d="m16 16 4.2 4.2" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <button
              type="button"
              className="relative flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
              onClick={onCartOpen}
              aria-label="Open shopping bag"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="hidden sm:inline">Bag</span>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-gray-900 text-xs font-semibold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {isNavOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100 dark:border-gray-800" aria-label="Mobile navigation">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    onCategoryChange(category);
                    setIsNavOpen(false);
                  }}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeCategory === category
                      ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  aria-pressed={activeCategory === category}
                >
                  {category}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}