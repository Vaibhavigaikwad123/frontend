import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Trash2, Plus, Minus, Home } from 'lucide-react';
import { getImageUrl } from '../utils/imageHelper';
import { formatPrice } from '../utils/formatPrice';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, total, count } = useCart();
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    if (count === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <h2 className={`text-3xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Your cart is empty</h2>
                <p className={`mb-8 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Looks like you haven't added anything yet.</p>
                <Link to="/shop" className="bg-brand-600 text-white px-6 py-3 rounded-md hover:bg-brand-700 transition-colors">Continue Shopping</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className={`text-3xl font-bold transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>Shopping Cart</h1>
                <Link
                    to="/"
                    className={`flex items-center space-x-2 transition-colors font-medium px-4 py-2 rounded-lg border ${darkMode ? 'text-brand-400 hover:text-brand-300 bg-brand-900/10 border-brand-800' : 'text-brand-600 hover:text-brand-700 bg-brand-50 border-brand-100'}`}
                >
                    <Home className="h-5 w-5" />
                    <span>Back to Home</span>
                </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => (
                        <div key={item.product._id} className={`p-4 rounded-lg shadow-sm border flex gap-4 transition-colors ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                            <div className={`w-24 h-24 rounded-md overflow-hidden flex-shrink-0 transition-colors ${darkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
                                {item.product.images && item.product.images[0] && (
                                    <img src={getImageUrl(item.product.images[0])} alt={item.product.name} className="w-full h-full object-cover" />
                                )}
                            </div>
                            <div className="flex-grow">
                                <Link to={`/product/${item.product._id}`} className={`font-semibold text-lg mb-1 block transition-colors ${darkMode ? 'text-gray-100 hover:text-brand-400' : 'text-gray-900 hover:text-brand-600'}`}>{item.product.name}</Link>
                                <p className={`text-sm mb-2 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.product.category}</p>
                                <div className="flex items-center justify-between">
                                    <span className={`font-bold text-lg transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>{formatPrice(item.product.price)}</span>
                                    <div className="flex flex-col items-end space-y-2">
                                        <div className={`flex items-center border rounded transition-colors overflow-hidden ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'}`}>
                                            <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className={`p-1 transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}><Minus className="h-4 w-4" /></button>
                                            <div className={`w-10 text-center font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.quantity}</div>
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                disabled={item.quantity >= item.product.stock}
                                                className={`p-1 transition-colors disabled:opacity-30 ${darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {item.quantity >= item.product.stock && (
                                            <span className="text-[10px] font-bold text-orange-500 uppercase">Max Stock Reached</span>
                                        )}
                                    </div>
                                    <button onClick={() => removeFromCart(item.product._id)} className={`p-2 rounded transition-colors ${darkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-500 hover:bg-red-50'}`}><Trash2 className="h-5 w-5" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className={`p-6 rounded-lg shadow-sm border h-fit transition-colors ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                    <h2 className={`text-xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Order Summary</h2>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                            <span className={`transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Subtotal ({count} items)</span>
                            <span className={`font-medium transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatPrice(total)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className={`transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Shipping</span>
                            <span className={`font-medium transition-colors ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Free</span>
                        </div>
                    </div>
                    <div className={`border-t pt-4 mb-6 transition-colors ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                        <div className={`flex justify-between text-xl font-bold transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                    </div>
                    <Link to="/checkout" className="block w-full bg-brand-600 text-white text-center py-3 rounded-md font-bold hover:bg-brand-700 transition-colors">
                        Proceed to Checkout
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Cart;
