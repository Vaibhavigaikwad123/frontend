import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Load cart from local storage on init
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.product._id === product._id);
            const currentQty = existing ? existing.quantity : 0;
            const newQty = currentQty + quantity;

            // Stock check
            if (newQty > product.stock) {
                // Return original state but with a message handled by toast (done in component)
                return prev;
            }

            if (existing) {
                return prev.map(item =>
                    item.product._id === product._id
                        ? { ...item, quantity: newQty }
                        : item
                );
            }
            return [...prev, { product, quantity }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product._id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        setCart(prev => {
            if (quantity <= 0) {
                return prev.filter(item => item.product._id !== productId);
            }
            return prev.map(item => {
                if (item.product._id === productId) {
                    const finalQty = Math.min(quantity, item.product.stock);
                    return { ...item, quantity: finalQty };
                }
                return item;
            });
        });
    };

    const clearCart = () => setCart([]);

    const total = parseFloat(cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2));
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, count }}>
            {children}
        </CartContext.Provider>
    );
};
