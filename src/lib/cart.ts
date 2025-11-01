import { CartItem, Cart } from "@/types/cart";

const CART_STORAGE_KEY = "oriental-essence-cart";

export const getCart = (): Cart => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return { items: [], total: 0 };
    return JSON.parse(stored);
  } catch {
    return { items: [], total: 0 };
  }
};

export const saveCart = (cart: Cart): void => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
};

export const addToCart = (product: { id: string; name: string; price: number; image_url?: string }): Cart => {
  const cart = getCart();
  const existingItem = cart.items.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
    });
  }
  
  cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  saveCart(cart);
  return cart;
};

export const removeFromCart = (productId: string): Cart => {
  const cart = getCart();
  cart.items = cart.items.filter(item => item.id !== productId);
  cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  saveCart(cart);
  return cart;
};

export const updateQuantity = (productId: string, quantity: number): Cart => {
  const cart = getCart();
  const item = cart.items.find(item => item.id === productId);
  
  if (item) {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    item.quantity = quantity;
  }
  
  cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  saveCart(cart);
  return cart;
};

export const clearCart = (): void => {
  localStorage.removeItem(CART_STORAGE_KEY);
};
