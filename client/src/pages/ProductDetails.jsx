import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ChevronLeft, Minus, Plus, Star, MessageSquare, Send, Heart, Share2, Copy, Check } from 'lucide-react';
import api from '../utils/api';
import { getImageUrl } from '../utils/imageHelper';
import { formatPrice } from '../utils/formatPrice';
import Button from '../components/ui/Button';
import RecentlyViewed from '../components/RecentlyViewed';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [newRating, setNewRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);
    // Image gallery state
    const [selectedImage, setSelectedImage] = useState(0);
    // Variant state
    const [selectedVariant, setSelectedVariant] = useState(null);
    // Notify Me state
    const [notifyEmail, setNotifyEmail] = useState('');
    const [isNotifying, setIsNotifying] = useState(false);
    // Share state
    const [copied, setCopied] = useState(false);

    const { addToast } = useToast();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { darkMode } = useTheme();

    useEffect(() => {
        fetchProduct();
        fetchReviews();
    }, [id]);

    // Save to Recently Viewed
    useEffect(() => {
        if (product) {
            const stored = localStorage.getItem('recentlyViewed');
            let history = stored ? JSON.parse(stored) : [];
            history = history.filter(p => p && p._id !== product._id);
            history.unshift(product);
            if (history.length > 10) history = history.slice(0, 10);
            localStorage.setItem('recentlyViewed', JSON.stringify(history));
        }
    }, [product]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/products/${id}`);
            setProduct(res.data);
            setSelectedImage(0);
            setSelectedVariant(null);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const fetchReviews = async () => {
        setIsLoadingReviews(true);
        try {
            const res = await api.get(`/reviews/${id}`);
            setReviews(res.data);
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setIsLoadingReviews(false);
        }
    };

    const effectiveStock = selectedVariant !== null && product?.variants?.length > 0
        ? product.variants[selectedVariant].stock
        : product?.stock ?? 0;

    const handleAddToCart = () => {
        if (!user) {
            addToast('Please log in to continue your purchase', 'info');
            navigate('/login', { state: { from: location } });
            return;
        }
        if (product?.variants?.length > 0 && selectedVariant === null) {
            addToast('Please select a variant first', 'warning');
            return;
        }
        const existingItem = (JSON.parse(localStorage.getItem('cart')) || []).find(item => item.product._id === product._id);
        const currentQty = existingItem ? existingItem.quantity : 0;
        if (currentQty + quantity > effectiveStock) {
            addToast(`Only ${effectiveStock} items available. You already have ${currentQty} in cart.`, 'error');
            return;
        }
        addToCart(product, quantity);
        addToast('Added to cart!', 'success');
    };

    const handleBuyNow = () => {
        if (!user) {
            addToast('Please log in to checkout', 'info');
            navigate('/login', { state: { from: location } });
            return;
        }
        if (product?.variants?.length > 0 && selectedVariant === null) {
            addToast('Please select a variant first', 'warning');
            return;
        }
        const existingItem = (JSON.parse(localStorage.getItem('cart')) || []).find(item => item.product._id === product._id);
        const currentQty = existingItem ? existingItem.quantity : 0;
        if (currentQty + quantity > effectiveStock) {
            addToast(`Only ${effectiveStock} items available. You already have ${currentQty} in cart.`, 'error');
            return;
        }
        addToCart(product, quantity);
        navigate('/checkout');
    };

    const handleAddToWishlist = async () => {
        if (!user) {
            addToast('Please login to use wishlist', 'info');
            return;
        }
        await toggleWishlist(product);
    };

    const handleNotifyMe = async (e) => {
        e.preventDefault();
        if (!notifyEmail.trim()) return;
        setIsNotifying(true);
        try {
            const res = await api.post(`/products/${product._id}/notify`, { email: notifyEmail });
            addToast(res.data.message, 'success');
            setNotifyEmail('');
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to subscribe', 'error');
        } finally {
            setIsNotifying(false);
        }
    };

    const handleShare = (platform) => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(`Check out ${product.name} on StationaryHub!`);
        if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
        } else if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            addToast('Link copied to clipboard!', 'success');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            addToast("Please login to write a review", "error");
            return;
        }
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await api.post(`/reviews/${product._id}`, {
                rating: newRating,
                comment: newComment
            });

            const newReviewObj = {
                ...res.data,
                user: { name: user.name }
            };

            setReviews([newReviewObj, ...reviews]);
            setNewComment("");

            const updatedNumReviews = (product.numReviews || 0) + 1;
            const currentAvg = parseFloat(product.avgRating) || 0;
            const updatedAvgRating = ((currentAvg * (product.numReviews || 0)) + newRating) / updatedNumReviews;

            setProduct({
                ...product,
                numReviews: updatedNumReviews,
                avgRating: updatedAvgRating.toFixed(1)
            });

            addToast("Review submitted successfully!", "success");
        } catch (err) {
            addToast("Failed to submit review", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-12 text-center">Loading...</div>;
    if (!product) return <div className="p-12 text-center">Product not found.</div>;

    const images = product.images && product.images.length > 0 ? product.images : [];
    const hasVariants = product.variants && product.variants.length > 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button onClick={() => navigate(-1)} className={`flex items-center transition-colors mb-8 ${darkMode ? 'text-gray-400 hover:text-brand-400' : 'text-gray-600 hover:text-brand-600'}`}>
                <ChevronLeft className="h-5 w-5 mr-1" /> Back
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* ── IMAGE GALLERY ── */}
                <div className="space-y-3">
                    {/* Main image */}
                    <div className={`aspect-square rounded-2xl overflow-hidden border transition-colors ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-100 border-gray-100'}`}>
                        {images[selectedImage] ? (
                            <img
                                src={getImageUrl(images[selectedImage])}
                                alt={product.name}
                                className="w-full h-full object-cover transition-all duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                        )}
                    </div>
                    {/* Thumbnail strip */}
                    {images.length > 1 && (
                        <div className="flex gap-2 flex-wrap">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx
                                        ? 'border-brand-500 shadow-md shadow-brand-200'
                                        : darkMode ? 'border-gray-800 opacity-60 hover:opacity-100' : 'border-gray-200 opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img src={getImageUrl(img)} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── DETAILS ── */}
                <div>
                    <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>{product.name}</h1>

                    {/* Rating */}
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-5 w-5 ${i < Math.round(product.avgRating || 0) ? "text-yellow-400 fill-current" : "text-gray-200"}`} />
                            ))}
                        </div>
                        <span className={`text-sm font-bold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {product.avgRating || 0} ({product.numReviews || 0} reviews)
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline space-x-3 mb-4">
                        <p className={`text-3xl font-black transition-colors ${darkMode ? 'text-brand-400' : 'text-brand-600'}`}>{formatPrice(product.price)}</p>
                        <div className={`flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span className="text-sm mr-1">M.R.P.:</span>
                            <span className="text-lg line-through">{formatPrice(Math.round(product.price * 1.2))}</span>
                        </div>
                    </div>

                    {/* ── SOCIAL SHARE ── */}
                    <div className="flex items-center gap-2 mb-5">
                        <span className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Share:</span>
                        <button
                            onClick={() => handleShare('whatsapp')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${darkMode ? 'bg-green-900/20 text-green-400 hover:bg-green-900/40' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                        >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                            WhatsApp
                        </button>
                        <button
                            onClick={() => handleShare('twitter')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${darkMode ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/40' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                        >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.724-8.843-8.158-10.657h6.042l4.265 5.642zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            X
                        </button>
                        <button
                            onClick={() => handleShare('copy')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${darkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                    </div>

                    {/* Description */}
                    <div className={`prose prose-sm mb-6 border-t pt-5 ${darkMode ? 'text-gray-400 border-gray-800' : 'text-gray-500 border-gray-100'}`}>
                        <p className="leading-relaxed">{product.description}</p>
                    </div>

                    {/* ── VARIANT SELECTOR ── */}
                    {hasVariants && (
                        <div className="mb-5">
                            <span className={`text-sm font-bold uppercase tracking-wider block mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {product.variants[0]?.label || 'Variant'}:
                                {selectedVariant !== null && (
                                    <span className={`ml-2 font-medium normal-case tracking-normal ${darkMode ? 'text-brand-400' : 'text-brand-600'}`}>
                                        {product.variants[selectedVariant].value}
                                    </span>
                                )}
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {product.variants.map((v, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedVariant(idx)}
                                        disabled={v.stock === 0}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${selectedVariant === idx
                                            ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                                            : darkMode ? 'border-gray-800 text-gray-400 hover:border-gray-700' : 'border-gray-200 text-gray-600 hover:border-brand-300'
                                            } ${v.stock === 0 ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                                    >
                                        {v.value}
                                        {v.stock === 0 && <span className="ml-1 text-xs">(Out)</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="flex items-center space-x-4 mb-4">
                        <span className={`text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Quantity:</span>
                        <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-colors ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-white'}`}>
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className={`p-3 transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}>
                                <Minus className="h-4 w-4" />
                            </button>
                            <div className={`w-12 text-center font-black text-lg ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>{quantity}</div>
                            <button
                                onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))}
                                disabled={quantity >= effectiveStock}
                                className={`p-3 transition-colors disabled:opacity-30 ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        {effectiveStock > 0 && effectiveStock <= 10 && (
                            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest animate-pulse">Only {effectiveStock} left!</span>
                        )}
                        {effectiveStock > 10 && (
                            <span className="text-xs font-medium text-green-500 uppercase tracking-widest">In Stock ({effectiveStock})</span>
                        )}
                    </div>

                    {/* ── ACTION BUTTONS ── */}
                    {effectiveStock > 0 ? (
                        <div className="flex space-x-4 mb-4">
                            <Button onClick={handleAddToCart} className="flex-[2] py-4 rounded-xl shadow-lg shadow-brand-100">
                                Add to Cart
                            </Button>
                            <Button onClick={handleBuyNow} variant="secondary" className="flex-[2] py-4 rounded-xl border-2 border-brand-600 text-brand-600 hover:bg-brand-50">
                                Buy Now
                            </Button>
                            <button
                                onClick={handleAddToWishlist}
                                className={`p-4 border-2 rounded-xl transition-all active:scale-95 ${isInWishlist(product._id)
                                    ? darkMode ? "bg-red-900/10 border-red-900/20 text-red-500" : "bg-red-50 border-red-100 text-red-500"
                                    : darkMode ? "border-gray-800 text-gray-500 hover:bg-gray-900 hover:text-red-500" : "border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-red-500"
                                    }`}
                                title={isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                                <Heart className={`h-6 w-6 ${isInWishlist(product._id) ? "fill-current" : ""}`} />
                            </button>
                        </div>
                    ) : (
                        /* ── NOTIFY ME (Out of stock) ── */
                        <div className={`mb-6 p-5 rounded-2xl border-2 ${darkMode ? 'bg-orange-900/10 border-orange-900/20' : 'bg-orange-50 border-orange-100'}`}>
                            <p className={`text-sm font-bold mb-3 ${darkMode ? 'text-orange-300' : 'text-orange-700'}`}>
                                🔔 Out of Stock — Notify me when available
                            </p>
                            <form onSubmit={handleNotifyMe} className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={notifyEmail}
                                    onChange={e => setNotifyEmail(e.target.value)}
                                    required
                                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm border-2 outline-none focus:border-brand-500 transition-colors ${darkMode ? 'bg-gray-900 border-gray-800 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}
                                />
                                <button
                                    type="submit"
                                    disabled={isNotifying}
                                    className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all disabled:opacity-60"
                                >
                                    {isNotifying ? '...' : 'Notify Me'}
                                </button>
                            </form>
                        </div>
                    )}

                    {!user && <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-widest">Please log in to purchase.</p>}
                </div>
            </div>

            {/* REVIEWS SECTION */}
            <div className={`mt-24 border-t pt-16 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Left: Summary and Form */}
                    <div className="lg:col-span-1 space-y-12">
                        <div>
                            <h2 className={`text-3xl font-black mb-2 ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>Customer Feedback</h2>
                            <p className={`font-medium mb-8 text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Real reviews from our community</p>

                            <div className={`rounded-[2rem] p-8 text-center border-2 transition-colors ${darkMode ? 'bg-brand-900/10 border-brand-900/20' : 'bg-brand-50 border-brand-100/50'}`}>
                                <p className={`text-6xl font-black mb-2 ${darkMode ? 'text-brand-100' : 'text-brand-900'}`}>{product.avgRating || 0}</p>
                                <div className="flex justify-center mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-6 w-6 ${i < Math.round(product.avgRating || 0) ? "text-yellow-400 fill-current" : darkMode ? "text-gray-800" : "text-gray-200"}`} />
                                    ))}
                                </div>
                                <p className={`text-sm font-bold uppercase tracking-widest transition-colors ${darkMode ? 'text-brand-400' : 'text-brand-600'}`}>Based on {product.numReviews || 0} reviews</p>
                            </div>
                        </div>

                        {/* Review Form */}
                        <div className={`rounded-[2rem] p-8 border-2 transition-colors ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <h3 className={`text-xl font-bold mb-6 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Write a review</h3>
                            <form onSubmit={handleReviewSubmit} className="space-y-6">
                                <div>
                                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Overall Rating</label>
                                    <div className="flex space-x-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button type="button" key={star} onClick={() => setNewRating(star)} className="focus:outline-none transform hover:scale-110 transition-transform">
                                                <Star className={`h-8 w-8 ${star <= newRating ? "text-yellow-400 fill-current" : darkMode ? "text-gray-800" : "text-gray-200"}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className={`block text-[10px] font-black uppercase tracking-widest mb-3 transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Your Feedback</label>
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="What did you like (or dislike) about this product?"
                                        className={`w-full text-sm border-2 rounded-2xl p-4 min-h-[150px] resize-none focus:ring-0 focus:border-brand-500 transition-all ${darkMode ? 'border-gray-800 bg-gray-950/50 text-gray-100' : 'border-gray-100 bg-gray-50/50 text-gray-900'}`}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || !user}
                                        className="w-full mt-4 bg-brand-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-100 hover:bg-brand-700 disabled:bg-gray-200 transition-all flex items-center justify-center space-x-2"
                                    >
                                        {isSubmitting ? (
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <><span>Publish Review</span><Send className="h-4 w-4" /></>
                                        )}
                                    </button>
                                </div>
                                {!user && <p className="text-[10px] text-center font-bold text-red-500 uppercase tracking-tighter">Please login to share your experience</p>}
                            </form>
                        </div>
                    </div>

                    {/* Right: Review List */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className={`text-xl font-bold transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Recent Customer Feed</h3>
                            <div className={`h-px flex-1 mx-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}></div>
                            <span className={`text-xs font-black uppercase tracking-widest transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{reviews.length} total</span>
                        </div>

                        {isLoadingReviews ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-50">
                                <div className="h-10 w-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
                                <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">Loading feedback...</p>
                            </div>
                        ) : reviews.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {reviews.map((r, i) => (
                                    <div key={r._id || i} className={`p-8 rounded-[2rem] border-2 transition-all group shadow-sm ${darkMode ? 'bg-gray-900 border-gray-800 hover:border-brand-900' : 'bg-white border-gray-100 hover:border-brand-100'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center">
                                                <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-sm font-black uppercase transition-colors ${darkMode ? 'bg-brand-900/20 text-brand-300' : 'bg-brand-50 text-brand-700'}`}>
                                                    {r.user?.name?.charAt(0) || "U"}
                                                </div>
                                                <div className="ml-3">
                                                    <p className={`text-sm font-bold transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{r.user?.name || "Verified Customer"}</p>
                                                    <p className={`text-[10px] font-bold uppercase transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{new Date(r.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className={`flex px-2 py-1 rounded-lg transition-colors ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                                <span className={`text-[10px] font-black ml-1 ${darkMode ? 'text-yellow-500' : 'text-yellow-700'}`}>{r.rating}</span>
                                            </div>
                                        </div>
                                        <p className={`text-sm leading-relaxed font-medium italic transition-colors ${darkMode ? 'text-gray-400 group-hover:text-gray-200' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                            "{r.comment}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={`text-center py-32 rounded-[3rem] border-2 border-dashed transition-colors ${darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50/50 border-gray-100'}`}>
                                <MessageSquare className={`h-16 w-16 mx-auto mb-4 transition-colors ${darkMode ? 'text-gray-800' : 'text-gray-200'}`} />
                                <p className={`text-lg font-bold italic transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>No reviews yet. Be the first!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RECENTLY VIEWED */}
            {product && <RecentlyViewed currentProductId={product._id} />}
        </div>
    );
};

export default ProductDetails;
