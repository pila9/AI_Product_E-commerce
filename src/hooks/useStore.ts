import { useState, useEffect, useCallback } from 'react';
import type { Product } from '../data/products';

interface CartItem {
  [productId: string]: number;
}

export function useCart() {
  const [cart, setCart] = useState<CartItem>(() => {
    try {
      const stored = localStorage.getItem('morrow-cart');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('morrow-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  }, []);

  const updateQuantity = useCallback((productId: string, change: number) => {
    setCart((prev) => {
      const newQuantity = (prev[productId] || 0) + change;
      if (newQuantity <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQuantity };
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => {
      const { [productId]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({});
  }, []);

  const getCartItems = useCallback((products: Product[]) => {
    return Object.entries(cart)
      .filter(([id, quantity]) =>
        products.some((p) => p.id === id) && Number.isInteger(quantity) && quantity > 0
      )
      .map(([id, quantity]) => ({
        product: products.find((p) => p.id === id)!,
        quantity,
      }));
  }, [cart]);

  const getCartCount = useCallback(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  const getSubtotal = useCallback((products: Product[]) => {
    return Object.entries(cart).reduce((sum, [id, quantity]) => {
      const product = products.find((p) => p.id === id);
      return product ? sum + product.price * quantity : sum;
    }, 0);
  }, [cart]);

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartItems,
    getCartCount,
    getSubtotal,
  };
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('morrow-favorites');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem('morrow-favorites', JSON.stringify([...favorites]));
  }, [favorites]);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (productId: string) => favorites.has(productId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}

export function useRecommendations() {
  const [activeEdit, setActiveEdit] = useState<{ productIds: string[]; summary: string } | null>(null);
  const [activeQuery, setActiveQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestEdit = useCallback(async (prompt: string) => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Could not create recommendations.');
      }

      setActiveQuery(prompt.trim());
      setActiveEdit({
        productIds: result.productIds,
        summary: result.summary,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearEdit = useCallback(() => {
    setActiveEdit(null);
    setActiveQuery('');
    setError(null);
  }, []);

  return {
    activeEdit,
    activeQuery,
    isLoading,
    error,
    requestEdit,
    clearEdit,
  };
}