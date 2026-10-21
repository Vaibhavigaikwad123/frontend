import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trash2, ShoppingCart, Home } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { getImageUrl } from '../utils/imageHelper';
import { useTheme } from '../context/ThemeContext';

const Wishlist = () => {
    const { wishlist, loading, removeFromWishlist } = useWishlist();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const { darkMode } = useTheme();

    const handleAddToCart = (product) => {
        addToCart(product, 1);
        addToast('Added to cart', 'success');
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium transition-colors">Updating your collection...</p>
        </div>
    );

    if (!user) return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <h1 className={`text-3xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Your Wishlist</h1>
            <p className={`mb-8 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Please log in to see your saved items.</p>
            <Link to="/login" className="bg-brand-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-700 transition shadow-lg">Login Now</Link>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div>
                        <h1 className={`text-3xl font-black uppercase tracking-tight transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>My Wishlist</h1>
                        <div className="h-1 w-20 bg-brand-600 rounded-full mt-2" />
                    </div>
                    <Link
                        to="/"
                        className={`flex items-center space-x-2 transition-colors font-medium px-4 py-2 rounded-lg border ml-4 ${darkMode ? 'text-brand-400 hover:text-brand-300 bg-brand-900/10 border-brand-800' : 'text-brand-600 hover:text-brand-700 bg-brand-50 border-brand-100'}`}
                    >
                        <Home className="h-5 w-5" />
                        <span>Back to Home</span>
                    </Link>
                </div>
                {wishlist.length > 0 && (
                    <span className={`px-4 py-1 rounded-full text-sm font-bold border transition-colors ${darkMode ? 'bg-brand-900/10 text-brand-300 border-brand-900/20' : 'bg-brand-50 text-brand-700 border-brand-100'}`}>
                        {wishlist.length} Items Saved
                    </span>
                )}
            </div>

            {wishlist.length === 0 ? (
                <div className={`text-center py-32 rounded-3xl border-2 border-dashed transition-colors ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="text-6xl mb-6">💝</div>
                    <h2 className={`text-2xl font-bold mb-2 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Your wishlist is empty</h2>
                    <p className={`mb-8 max-w-sm mx-auto transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Start exploring and save your favorite stationery items for later!</p>
                    <Link to="/shop" className={`inline-flex items-center font-bold transition group ${darkMode ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700'}`}>
                        Browse Shop
                        <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {wishlist.map(product => (
                        <div key={product._id} className={`rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border p-4 relative group transform hover:-translate-y-1 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                            {/* Remove Button */}
                            <button
                                onClick={() => removeFromWishlist(product._id)}
                                className={`absolute top-6 right-6 p-2.5 rounded-full shadow-lg z-10 transition-all hover:scale-110 ${darkMode ? 'bg-gray-800 text-gray-500 hover:text-red-400' : 'bg-white text-gray-500 hover:text-red-600'}`}
                                title="Remove item"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>

                            <Link to={`/product/${product._id}`} className="block">
                                <div className={`aspect-square rounded-xl mb-4 overflow-hidden transition-colors ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
                                    <img
                                        src={getImageUrl(product.images?.[0])}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => (e.target.src = "/assets/products/placeholder.jpg")}
                                    />
                                </div>
                                <div className="mb-4">
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${darkMode ? 'text-brand-400' : 'text-brand-600'}`}>{product.category}</p>
                                    <h3 className={`font-bold leading-tight line-clamp-1 transition-colors uppercase text-sm tracking-wide ${darkMode ? 'text-gray-100 group-hover:text-brand-400' : 'text-gray-900 group-hover:text-brand-600'}`}>
                                        {product.name}
                                    </h3>
                                    <p className={`text-lg font-black mt-1 transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>₹{product.price}</p>
                                </div>
                            </Link>

                            <button
                                onClick={() => handleAddToCart(product)}
                                className="w-full flex items-center justify-center space-x-2 bg-brand-600 text-white py-2.5 rounded-xl font-bold hover:bg-brand-700 transition shadow-md hover:shadow-lg active:scale-95"
                            >
                                <ShoppingCart className="h-4 w-4" />
                                <span className="text-xs uppercase tracking-widest">Add to Cart</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
