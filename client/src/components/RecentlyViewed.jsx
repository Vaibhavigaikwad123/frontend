import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

const RecentlyViewed = ({ currentProductId }) => {
    const [recentProducts, setRecentProducts] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem('recentlyViewed');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Filter out the current product so it doesn't show in "Recently Viewed" while you are looking at it
                const filtered = parsed.filter(p => p._id !== currentProductId);
                setRecentProducts(filtered.slice(0, 4)); // Show top 4
            } catch (e) {
                console.error("Error parsing recently viewed", e);
            }
        }
    }, [currentProductId]);

    if (recentProducts.length === 0) return null;

    return (
        <div className="mt-24 border-t dark:border-gray-800 pt-16">
            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-50 mb-8">Recently Viewed</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {recentProducts.map(product => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default RecentlyViewed;
