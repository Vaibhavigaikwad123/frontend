import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Star, ShoppingCart } from 'lucide-react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageHelper';
import { formatPrice } from '../utils/formatPrice';

const Compare = () => {
    const { darkMode } = useTheme();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('compareList') || '[]');
        if (stored.length === 0) { setLoading(false); return; }

        const fetchProducts = async () => {
            try {
                const results = await Promise.all(
                    stored.map(id => api.get(`/products/${id}`).then(r => r.data).catch(() => null))
                );
                setProducts(results.filter(Boolean));
            } catch (err) {
                console.error('Compare fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const removeFromCompare = (productId) => {
        const stored = JSON.parse(localStorage.getItem('compareList') || '[]');
        const updated = stored.filter(id => id !== productId);
        localStorage.setItem('compareList', JSON.stringify(updated));
        setProducts(prev => prev.filter(p => p._id !== productId));
    };

    const clearAll = () => {
        localStorage.setItem('compareList', '[]');
        setProducts([]);
    };

    const handleAddToCart = (product) => {
        if (!user) { addToast('Please login to add to cart', 'info'); return; }
        addToCart(product, 1);
        addToast(`${product.name} added to cart!`, 'success');
    };

    const attributes = [
        { label: 'Category', key: (p) => p.category },
        { label: 'Brand', key: (p) => p.brand || '—' },
        { label: 'Price', key: (p) => formatPrice(p.price) },
        { label: 'Rating', key: (p) => `${p.avgRating || 0} ⭐ (${p.numReviews || 0} reviews)` },
        { label: 'Stock', key: (p) => p.stock > 0 ? `${p.stock} units` : 'Out of stock' },
        { label: 'Variants', key: (p) => p.variants?.length > 0 ? p.variants.map(v => v.value).join(', ') : 'Standard only' },
        { label: 'Description', key: (p) => p.description?.slice(0, 100) + (p.description?.length > 100 ? '...' : '') },
    ];

    if (loading) return <div className="p-20 text-center text-gray-500">Loading comparison...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className={`text-3xl font-black ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>Product Comparison</h1>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Compare up to 3 products side by side</p>
                </div>
                {products.length > 0 && (
                    <button onClick={clearAll} className="text-sm text-red-500 hover:text-red-700 font-bold transition-colors">
                        Clear All
                    </button>
                )}
            </div>

            {products.length === 0 ? (
                <div className={`text-center py-32 rounded-3xl border-2 border-dashed ${darkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                    <p className="text-5xl mb-4">🔄</p>
                    <p className="text-lg font-bold mb-2">No products to compare</p>
                    <p className="text-sm mb-6">Add products from the shop by clicking the Compare button</p>
                    <Link to="/shop" className="inline-block px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition">
                        Browse Shop
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <td className={`w-40 p-4 text-sm font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Attribute</td>
                                {products.map(product => (
                                    <td key={product._id} className={`p-4 text-center ${darkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-100'} rounded-t-2xl`}>
                                        <div className="relative">
                                            <button
                                                onClick={() => removeFromCompare(product._id)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
                                            >
                                                <X size={12} />
                                            </button>
                                            <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden bg-gray-100 mb-3">
                                                <img src={getImageUrl(product.images?.[0])} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <Link to={`/product/${product._id}`} className={`text-sm font-bold hover:text-brand-600 transition line-clamp-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                                {product.name}
                                            </Link>
                                        </div>
                                    </td>
                                ))}
                                {/* Empty slot */}
                                {products.length < 3 && (
                                    <td className={`p-4 text-center border-2 border-dashed rounded-2xl ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                                        <Link to="/shop" className={`text-sm font-bold ${darkMode ? 'text-gray-500 hover:text-brand-400' : 'text-gray-400 hover:text-brand-600'} transition`}>
                                            + Add Product
                                        </Link>
                                    </td>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {attributes.map((attr, i) => (
                                <tr key={i} className={i % 2 === 0 ? darkMode ? 'bg-gray-900/30' : 'bg-gray-50/50' : ''}>
                                    <td className={`p-4 text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{attr.label}</td>
                                    {products.map(product => (
                                        <td key={product._id} className={`p-4 text-center text-sm ${darkMode ? 'text-gray-300 border-x border-gray-800' : 'text-gray-700 border-x border-gray-100'}`}>
                                            {attr.key(product)}
                                        </td>
                                    ))}
                                    {products.length < 3 && <td />}
                                </tr>
                            ))}
                            {/* Add to Cart row */}
                            <tr>
                                <td className="p-4" />
                                {products.map(product => (
                                    <td key={product._id} className={`p-4 text-center border border-gray-100 dark:border-gray-800 rounded-b-2xl`}>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={product.stock <= 0}
                                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition ${product.stock <= 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600' : 'bg-brand-600 text-white hover:bg-brand-700'}`}
                                        >
                                            <ShoppingCart size={16} />
                                            {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </button>
                                    </td>
                                ))}
                                {products.length < 3 && <td />}
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Compare;
