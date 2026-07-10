/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aquacare-p78r.onrender.com';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in VND
  image: string;
  rating?: number;
  details?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  user: any;
  isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncingFromDb, setIsSyncingFromDb] = useState(true);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('aquacare_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e);
      }
    }
    return [];
  });

  // Initialize Auth & Fetch DB Cart
  useEffect(() => {
    let mounted = true;

    const fetchAndMergeCart = async (currentUser: any) => {
      if (!currentUser) return;
      
      const { data: dbCartItems } = await supabase
        .from('cart_items')
        .select(`quantity, products ( id, name, description, price, image_url, details )`)
        .eq('user_id', currentUser.id);

      if (dbCartItems && dbCartItems.length > 0 && mounted) {
        const dbCart: CartItem[] = dbCartItems.map((item: any) => ({
          id: item.products.id,
          name: item.products.name,
          description: item.products.description,
          price: item.products.price,
          image: item.products.image_url,
          rating: 5.0,
          details: item.products.details || [],
          quantity: item.quantity
        }));

        setCart(prevCart => {
          const merged = [...prevCart];
          dbCart.forEach(dbItem => {
            const existing = merged.find(i => i.id === dbItem.id);
            if (existing) {
              existing.quantity = Math.max(existing.quantity, dbItem.quantity);
            } else {
              merged.push(dbItem);
            }
          });
          return merged;
        });
      }
    };

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      if (mounted) {
        setUser(currentUser);
        if (currentUser) {
          await fetchAndMergeCart(currentUser);
        }
        setIsInitialized(true);
        setIsSyncingFromDb(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      const currentUser = session?.user || null;
      
      if (event === 'SIGNED_OUT') {
        setCart([]);
        setUser(null);
      } else if (event === 'SIGNED_IN') {
        setIsSyncingFromDb(true);
        setUser(currentUser);
        await fetchAndMergeCart(currentUser);
        setIsSyncingFromDb(false);
      } else if (event === 'INITIAL_SESSION') {
        setUser(currentUser);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sync to localStorage and Supabase whenever cart changes
  useEffect(() => {
    localStorage.setItem('aquacare_cart', JSON.stringify(cart));
    
    if (isInitialized && user && !isSyncingFromDb) {
      const syncToDb = async () => {
        const { data: currentDbItems } = await supabase.from('cart_items').select('product_id').eq('user_id', user.id);
        
        const itemsToUpsert = cart.map(item => ({
          user_id: user.id,
          product_id: item.id,
          quantity: item.quantity
        }));

        if (itemsToUpsert.length > 0) {
          const { error } = await supabase.from('cart_items').upsert(itemsToUpsert, { onConflict: 'user_id,product_id' });
          if (error) console.error("Error upserting cart:", error);
        }

        if (currentDbItems) {
          const localIds = cart.map(c => c.id);
          const idsToDelete = currentDbItems.map(i => i.product_id).filter(id => !localIds.includes(id));
          if (idsToDelete.length > 0) {
            const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id).in('product_id', idsToDelete);
            if (error) console.error("Error deleting cart items:", error);
          }
        }
      };
      syncToDb();
    }
  }, [cart, isInitialized, user, isSyncingFromDb]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        user,
        isInitialized
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
