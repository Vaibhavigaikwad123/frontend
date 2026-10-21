import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { Heart, ShoppingCart, GitCompare } from "lucide-react";
import { getImageUrl } from "../utils/imageHelper";
import { formatPrice } from "../utils/formatPrice";

const getCompareList = () => JSON.parse(localStorage.getItem('compareList') || '[]');
const setCompareList = (list) => localStorage.setItem('compareList', JSON.stringify(list));

const ProductCard = ({ product: initialProduct }) => {
    const [product] = useState(initialProduct);
    const [isInCompare, setIsInCompare] = useState(() => getCompareList().includes(initialProduct._id));
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { addToast } = useToast();
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const isWishlisted = isInWishlist(product._id);

    const handleCompare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const list = getCompareList();
        if (isInCompare) {
            setCompareList(list.filter(id => id !== product._id));
            setIsInCompare(false);
            addToast('Removed from comparison', 'info');
        } else {
            if (list.length >= 3) {
                addToast('You can compare up to 3 products', 'warning');
                return;
            }
            setCompareList([...list, product._id]);
            setIsInCompare(true);
            addToast('Added to comparison! Visit /compare to see', 'success');
        }
    };

    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            addToast('Please login to continue purchase', 'error');
            navigate('/login', { state: { from: location } });
            return;
        }

        addToCart(product, 1);
        addToast('Added to cart', 'success');
    };

    return (
        <div className={`group rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border overflow-hidden flex flex-col h-full transform hover:-translate-y-1 relative ${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'}`}>
            {/* Wishlist Heart Overlay */}
            <button
                onClick={handleWishlistClick}
                className={`absolute top-4 right-4 z-20 p-2.5 rounded-full shadow-lg h-10 w-10 flex items-center justify-center transition-all duration-300 ${isWishlisted ? 'bg-red-500 text-white scale-110' : darkMode ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-white text-black hover:bg-gray-50 hover:scale-110'}`}
            >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={2.5} />
            </button>

            {/* Image Section - ALWAYS WHITE BACKGROUND */}
            <Link to={`/product/${product._id}`} className="relative aspect-[4/3] overflow-hidden bg-white block p-4">
                <img
                    src={getImageUrl(product.images?.[0])}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => (e.target.src = "/assets/products/placeholder.jpg")}
                />
                {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider">Out of Stock</span>
                    </div>
                )}
            </Link>

            {/* Content Section - ADAPTIVE BACKGROUND */}
            <div className={`p-5 flex-1 flex flex-col transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className="mb-3">
                    <p className="text-[11px] font-medium text-blue-600 dark:text-blue-500 uppercase tracking-widest mb-1">{product.category}</p>
                    <Link to={`/product/${product._id}`} className="block">
                        <h3 className={`font-bold text-lg leading-tight line-clamp-2 min-h-[3rem] transition-colors uppercase ${darkMode ? 'text-white hover:text-brand-400' : 'text-black hover:text-brand-600'}`}>
                            {product.name}
                        </h3>
                    </Link>
                </div>

                <div className="mt-auto space-y-4">
                    <div className="flex flex-wrap items-baseline gap-2">
                        <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{formatPrice(product.price)}</span>
                        <div className="flex items-center text-sm text-gray-400 dark:text-gray-500">
                            <span className="mr-1">M.R.P.:</span>
                            <span className="line-through">{formatPrice(Math.round(product.price * 1.2))}</span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl font-bold transition duration-300 ${product.stock <= 0
                                ? darkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-500'
                                : 'bg-brand-600 text-white hover:bg-brand-700 shadow-md hover:shadow-lg active:scale-95'
                                }`}
                        >
                            <ShoppingCart size={16} />
                            <span className="text-xs uppercase tracking-widest text-white">
                                {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                            </span>
                        </button>
                        <button
                            onClick={handleCompare}
                            title={isInCompare ? 'Remove from Compare' : 'Add to Compare'}
                            className={`p-2.5 rounded-xl border-2 transition-all ${isInCompare
                                ? 'border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
                                : darkMode ? 'border-gray-800 text-gray-500 hover:border-brand-700 hover:text-brand-400' : 'border-gray-200 text-gray-400 hover:border-brand-300 hover:text-brand-600'
                                }`}
                        >
                            <GitCompare size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
