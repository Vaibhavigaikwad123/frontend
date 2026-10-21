import { createContext, useState, useContext, useEffect, useMemo } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { addToast } = useToast();

    // Fetch wishlist when user logs in
    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [user]);

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            const res = await api.get('/wishlist');
            setWishlist(res.data.products || []);
        } catch (err) {
            console.error('Error fetching wishlist:', err);
        } finally {
            setLoading(false);
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => (item._id || item) === productId);
    };

    const toggleWishlist = async (product) => {
        if (!user) {
            addToast('Please login to manage wishlist', 'info');
            return false;
        }

        const productId = product._id || product;
        const alreadyIn = isInWishlist(productId);

        // Optimistic update
        if (alreadyIn) {
            setWishlist(prev => prev.filter(item => (item._id || item) !== productId));
        } else {
            setWishlist(prev => [...prev, product]);
        }

        try {
            if (alreadyIn) {
                await api.delete(`/wishlist/remove/${productId}`);
                addToast('Removed from wishlist', 'info');
            } else {
                await api.post(`/wishlist/add/${productId}`);
                addToast('Added to wishlist', 'success');
            }
            return true;
        } catch (err) {
            // Rollback on error
            console.error('Wishlist toggle error:', err);
            addToast('Failed to update wishlist', 'error');
            fetchWishlist(); // Refresh from server
            return false;
        }
    };

    const removeFromWishlist = async (productId) => {
        // Simple wrapper for toggle logic if we only want to remove
        if (isInWishlist(productId)) {
            await toggleWishlist({ _id: productId });
        }
    };

    const wishlistIds = useMemo(() => new Set(wishlist.map(p => p._id || p)), [wishlist]);

    const value = {
        wishlist,
        wishlistIds,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        wishlistCount: wishlist.length
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
