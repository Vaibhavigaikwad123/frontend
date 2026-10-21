import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { formatPrice } from '../utils/formatPrice';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Package, MapPin, User as UserIcon, Plus, Trash2, X, ChevronRight, CheckCircle, RefreshCw, Undo2, Clock, Home } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import ReturnRequestModal from '../components/ReturnRequestModal';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [returns, setReturns] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'returns'
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        isDefault: false
    });
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    // darkMode removed as we use CSS classes now
    // const { darkMode } = useTheme();

    useEffect(() => {
        if (user) {
            fetchUserProfile(); // Fetch profile and addresses
            fetchOrders();
            fetchReturns();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    const fetchReturns = async () => {
        try {
            const res = await api.get('/returns');
            setReturns(res.data);
        } catch (err) {
            console.error('Error fetching returns:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            setAddresses(res.data.addresses || []);
            setUserProfile(res.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    const handleCancelOrder = async (orderId) => {
        const order = orders.find(o => o._id === orderId);

        // Check if order can be cancelled
        if (['Shipped', 'Delivered'].includes(order.status)) {
            addToast('Cannot cancel shipped/delivered orders. Please use Return Request.', 'error');
            return;
        }

        // Show different confirmation based on payment status
        const confirmMessage = order.paymentStatus === 'Paid'
            ? `Cancel this order?\n\nYour payment of ${formatPrice(order.totalAmount)} will be automatically refunded to your original payment method within 5-7 business days.`
            : 'Are you sure you want to cancel this order?';

        if (!window.confirm(confirmMessage)) return;

        try {
            const res = await api.post(`/orders/${orderId}/cancel`);
            addToast(res.data.message, 'success');

            // Show refund info if applicable
            if (res.data.refund) {
                const refundMsg = res.data.refund.isMock
                    ? `Refund processed in test mode. Refund ID: ${res.data.refund.id}`
                    : `Refund initiated: ${formatPrice(res.data.refund.amount)}. Refund ID: ${res.data.refund.id}`;
                addToast(refundMsg, 'info');
            }

            fetchOrders();
        } catch (err) {
            const message = err.response?.data?.message || 'Error cancelling order';
            addToast(message, 'error');
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/users/address', newAddress);
            setAddresses(res.data);
            setNewAddress({ street: '', city: '', state: '', zip: '', country: 'India', isDefault: false });
            setShowAddressForm(false);
            addToast('Address added successfully', 'success');
        } catch (err) {
            addToast('Error adding address', 'error');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        try {
            const res = await api.delete(`/users/address/${addressId}`);
            setAddresses(res.data);
            addToast('Address deleted', 'info');
        } catch (err) {
            addToast('Error deleting address', 'error');
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        try {
            const res = await api.put(`/users/address/${addressId}/default`);
            setAddresses(res.data);
            addToast('Default address updated', 'success');
        } catch (err) {
            addToast('Error updating default address', 'error');
        }
    };

    if (!user) return <div className="p-20 text-center">Please login to view profile.</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-colors text-gray-900 dark:text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-brand-900 dark:text-brand-400">My Profile</h1>
                <Link
                    to="/"
                    className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors font-medium bg-brand-50 dark:bg-brand-900/10 px-4 py-2 rounded-lg border border-brand-100 dark:border-brand-800"
                >
                    <Home className="h-5 w-5" />
                    <span>Back to Home</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Info & Addresses */}
                <div className="space-y-6">
                    {/* User Info Card */}
                    <div className="p-6 rounded-lg shadow-md border transition-colors bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4">
                                <div className="bg-brand-100 dark:bg-brand-900/20 p-3 rounded-full transition-colors">
                                    <UserIcon className="h-8 w-8 text-brand-600 dark:text-brand-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold transition-colors text-gray-900 dark:text-gray-100">{user.name}</h2>
                                    <p className="text-sm transition-colors text-gray-500 dark:text-gray-400">{user.email}</p>
                                </div>
                            </div>
                        </div>
                        {userProfile && (
                            <div className="mt-4 pt-4 border-t dark:border-gray-800">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    Loyalty Points: <span className="text-brand-600 font-bold ml-1">{userProfile.loyaltyPoints || 0}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Addresses Card */}
                    <div className="p-6 rounded-lg shadow-md border transition-colors bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg transition-colors text-gray-900 dark:text-gray-100">My Addresses</h3>
                            <button
                                onClick={() => setShowAddressForm(!showAddressForm)}
                                className="text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>

                        {showAddressForm && (
                            <form onSubmit={handleAddAddress} className="mb-4 p-4 bg-gray-50 dark:bg-gray-950 rounded space-y-3 border dark:border-gray-800 transition-colors">
                                <input
                                    type="text"
                                    placeholder="Street Address"
                                    className="w-full px-3 py-2 border dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
                                    value={newAddress.street}
                                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        placeholder="City"
                                        className="px-3 py-2 border dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="State"
                                        className="px-3 py-2 border dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
                                        value={newAddress.state}
                                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                        required
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="ZIP Code"
                                    className="w-full px-3 py-2 border dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors"
                                    value={newAddress.zip}
                                    onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                                    required
                                />
                                <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={newAddress.isDefault}
                                        onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                        className="rounded dark:bg-gray-800 dark:border-gray-700"
                                    />
                                    <span>Set as default</span>
                                </label>
                                <div className="flex space-x-2">
                                    <Button type="submit" className="flex-1 py-2 text-sm">Add</Button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddressForm(false)}
                                        className="px-4 py-2 border dark:border-gray-700 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="space-y-3">
                            {addresses.length === 0 ? (
                                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4 italic transition-colors">No addresses saved</p>
                            ) : (
                                addresses.map((addr) => (
                                    <div key={addr._id} className="p-3 border dark:border-gray-800 rounded text-sm relative hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        {addr.isDefault && (
                                            <span className="absolute top-2 right-2 px-2 py-1 bg-brand-100 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-xs rounded border border-brand-200 dark:border-brand-800 transition-colors">Default</span>
                                        )}
                                        <div className="flex items-start space-x-2">
                                            <MapPin className="h-4 w-4 mt-1 text-gray-500 dark:text-gray-500 transition-colors" />
                                            <div className="flex-1">
                                                <p className="text-gray-700 dark:text-gray-200 transition-colors">{addr.street}</p>
                                                <p className="text-gray-500 dark:text-gray-400 transition-colors">{addr.city}, {addr.state} - {addr.zip}</p>
                                            </div>
                                            <div className="flex flex-col items-end space-y-2">
                                                <button
                                                    onClick={() => handleDeleteAddress(addr._id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                {!addr.isDefault && (
                                                    <button onClick={() => handleSetDefaultAddress(addr._id)} className="text-[10px] uppercase font-bold text-brand-600 hover:underline">
                                                        Set Default
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Orders & Returns section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex border-b dark:border-gray-800 mb-6 relative">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`pb-4 px-6 font-bold text-sm transition-colors ${activeTab === 'orders' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            Order History
                        </button>
                        <button
                            onClick={() => setActiveTab('returns')}
                            className={`pb-4 px-6 font-bold text-sm transition-colors ${activeTab === 'returns' ? 'text-brand-600 dark:text-brand-400' : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            Returns & Exchanges
                        </button>
                        <div
                            className="absolute bottom-0 h-1 bg-brand-600 dark:bg-brand-500 transition-all duration-300 rounded-t-full"
                            style={{
                                left: activeTab === 'orders' ? '0' : '150px',
                                width: '150px'
                            }}
                        ></div>
                    </div>

                    {loading ? (
                        <p className="text-gray-600 dark:text-gray-400 transition-colors italic">Loading...</p>
                    ) : (
                        activeTab === 'orders' ? (
                            orders.length === 0 ? (
                                <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-sm border dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 transition-colors">
                                    No orders found.
                                </div>
                            ) : (
                                orders.map(order => (
                                    <div key={order._id} className="border rounded-lg overflow-hidden hover:shadow-md transition-all bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm">
                                        <div className="px-6 py-4 flex justify-between items-center border-b transition-colors bg-gray-50 dark:bg-gray-950 border-gray-100 dark:border-gray-800">
                                            <div>
                                                <p className="text-sm transition-colors text-gray-500 dark:text-gray-400">Order ID: <span className="font-mono text-gray-700 dark:text-gray-300">{order._id}</span></p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 transition-colors">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors
                                                ${order.status === 'Delivered' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800' :
                                                        order.status === 'Cancelled' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800' :
                                                            order.status === 'Out for Delivery' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800' :
                                                                'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'}`}>
                                                    {order.status}
                                                </span>
                                                <span className="font-bold text-lg transition-colors text-gray-900 dark:text-gray-50">{formatPrice(order.totalAmount)}</span>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</h4>
                                                    {order.items.map((item, index) => (
                                                        <div key={index} className="flex items-center space-x-4">
                                                            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0 border dark:border-gray-700">
                                                                {(item.product?.images?.[0] || item.image) ? (
                                                                    <img src={item.product?.images?.[0] || item.image} alt={item.product?.name || item.name} className="h-full w-full object-cover" />
                                                                ) : (
                                                                    <Package className="h-6 w-6 m-3 text-gray-300 dark:text-gray-700" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-semibold truncate text-gray-800 dark:text-gray-200">
                                                                    {item.product?.name || item.name || 'Product Removed'}
                                                                </p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                                            </div>
                                                            <p className="font-bold text-gray-900 dark:text-gray-100">{formatPrice(item.price * item.quantity)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="border-t md:border-t-0 md:border-l dark:border-gray-800 pt-6 md:pt-0 md:pl-6">
                                                    <div className="flex justify-between items-start gap-6 mb-4">
                                                        <div className="min-w-0">
                                                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Order Info</h4>
                                                            <div className="space-y-1">
                                                                <p className="text-sm flex items-center">
                                                                    <span className="text-gray-500 mr-2">Paid:</span>
                                                                    <span className={`font-bold ${(order.paymentMethod !== 'COD' || order.status === 'Delivered') ? 'text-green-600' : 'text-red-500'}`}>
                                                                        {(order.paymentMethod !== 'COD' || order.status === 'Delivered') ? 'YES' : 'NO'}
                                                                    </span>
                                                                </p>
                                                                <p className="text-sm flex items-center">
                                                                    <span className="text-gray-500 mr-2">Method:</span>
                                                                    <span className="text-gray-700 dark:text-gray-300 font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs ml-1">
                                                                        {order.paymentMethod}
                                                                        {order.paymentSubMethod && ` - ${order.paymentSubMethod.toUpperCase()}`}
                                                                    </span>
                                                                </p>

                                                                {/* Show Refund Status if applicable */}
                                                                {order.refundStatus && order.refundStatus !== 'None' && (
                                                                    <>
                                                                        <p className="text-sm flex items-center pt-2 border-t dark:border-gray-700 mt-2">
                                                                            <span className="text-gray-500 mr-2">Refund:</span>
                                                                            <span className={`font-bold text-xs px-2 py-0.5 rounded ${order.refundStatus === 'Processed' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                                                                                order.refundStatus === 'Failed' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' :
                                                                                    'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                                                                                }`}>
                                                                                {order.refundStatus}
                                                                            </span>
                                                                        </p>
                                                                        {order.refundAmount && (
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                Amount: {formatPrice(order.refundAmount)}
                                                                            </p>
                                                                        )}
                                                                        {order.refundId && (
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                                                ID: {order.refundId}
                                                                            </p>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col space-y-2 flex-shrink-0">
                                                            <button
                                                                onClick={() => { setSelectedOrder(order); setShowTrackingModal(true); }}
                                                                className="flex items-center justify-center space-x-2 text-brand-600 dark:text-brand-400 hover:text-brand-700 font-bold text-sm bg-brand-50 dark:bg-brand-900/10 px-3.5 py-2 rounded-xl transition-all border border-brand-100 dark:border-brand-800 hover:scale-[1.02] active:scale-[0.98]"
                                                            >
                                                                <span className="whitespace-nowrap">Track Order</span>
                                                                <ChevronRight className="h-4 w-4" />
                                                            </button>

                                                            {order.status === 'Delivered' && (
                                                                <button
                                                                    onClick={() => { setSelectedOrder(order); setShowReturnModal(true); }}
                                                                    className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-bold text-sm bg-gray-100 dark:bg-gray-800 px-3.5 py-2 rounded-xl transition-all border border-gray-200 dark:border-gray-700 hover:scale-[1.02] active:scale-[0.98]"
                                                                >
                                                                    <Undo2 className="h-4 w-4" />
                                                                    <span className="whitespace-nowrap">Return / Exchange</span>
                                                                </button>
                                                            )}

                                                            {['Pending', 'Confirmed'].includes(order.status) && (
                                                                <button
                                                                    onClick={() => handleCancelOrder(order._id)}
                                                                    className="flex items-center justify-center space-x-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 font-bold text-sm bg-red-50 dark:bg-red-900/10 px-3.5 py-2 rounded-xl transition-all border border-red-100 dark:border-red-800 hover:scale-[1.02] active:scale-[0.98]"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                    <span className="whitespace-nowrap">Cancel Order</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 mt-6">Shipping Address</h4>
                                                    <div className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <MapPin className="h-4 w-4 mt-0.5 text-gray-500 dark:text-gray-400" />
                                                        <div>
                                                            <p className="font-medium text-gray-800 dark:text-gray-200">
                                                                {order.shippingAddress?.street}
                                                            </p>
                                                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}</p>
                                                            <p>{order.shippingAddress?.country}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )
                        ) : (
                            /* Returns Tab Content */
                            returns.length === 0 ? (
                                <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow-sm border dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 transition-colors italic">
                                    No return or exchange requests found.
                                </div>
                            ) : (
                                returns.map(ret => (
                                    <div key={ret._id} className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                        <div className="px-6 py-4 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex justify-between items-center">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-2 rounded-lg ${ret.type === 'Exchange' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
                                                    {ret.type === 'Exchange' ? <RefreshCw className="h-5 w-5" /> : <Undo2 className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 dark:text-gray-200">{ret.type} Request</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500">{new Date(ret.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border
                                                ${ret.status === 'Completed' ? 'bg-green-100 border-green-200 text-green-700' :
                                                    ret.status === 'Rejected' ? 'bg-red-100 border-red-200 text-red-700' :
                                                        'bg-amber-50 border-amber-200 text-amber-700'}`}>
                                                {ret.status}
                                            </span>
                                        </div>

                                        <div className="p-6">
                                            <div className="flex justify-between mb-6">
                                                <div className="space-y-4 w-full">
                                                    {ret.items.map((item, i) => (
                                                        <div key={i} className="flex items-center space-x-4">
                                                            <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border dark:border-gray-700">
                                                                <img src={item.image || item.product?.images?.[0] || 'https://via.placeholder.com/50'} alt={item.name} className="h-full w-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-gray-100">{item.name || item.product?.name}</p>
                                                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Status Progress Bar */}
                                            <div className="relative pt-6 pb-2">
                                                <div className="flex mb-2 items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                                                    <span>Requested</span>
                                                    <span>Approved</span>
                                                    <span>Picked Up</span>
                                                    <span>Completed</span>
                                                </div>
                                                <div className="overflow-hidden h-1.5 mb-4 text-xs flex rounded-full bg-gray-100 dark:bg-gray-800">
                                                    <div
                                                        style={{
                                                            width:
                                                                ret.status === 'Pending' ? '25%' :
                                                                    ret.status === 'Approved' ? '50%' :
                                                                        ret.status === 'Picked Up' ? '75%' :
                                                                            ret.status === 'Received' ? '85%' :
                                                                                ret.status === 'Inspected' ? '90%' :
                                                                                    ret.status === 'Completed' ? '100%' : '0%'
                                                        }}
                                                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500
                                                            ${ret.status === 'Rejected' ? 'bg-red-500' : 'bg-brand-600'}`}
                                                    ></div>
                                                </div>
                                                {ret.adminNotes && (
                                                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 border dark:border-gray-800 rounded-xl text-sm italic text-gray-600 dark:text-gray-400">
                                                        <span className="font-bold not-italic mr-2">Admin Note:</span>
                                                        "{ret.adminNotes}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )
                        )
                    )}
                </div>
            </div>

            {/* Tracking Modal */}
            {showTrackingModal && selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10001] p-4 animate-in fade-in duration-300">
                    <div className="rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col transition-colors bg-white dark:bg-gray-900">
                        <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Track Order</h3>
                            <button onClick={() => setShowTrackingModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between mb-8">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Order Number</p>
                                    <p className="font-mono text-gray-900 dark:text-gray-100">#{selectedOrder._id.slice(-8).toUpperCase()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Status</p>
                                    <p className="font-bold text-brand-600 uppercase text-sm">{selectedOrder.status}</p>
                                </div>
                            </div>

                            {/* Horizontal Progress Bar - 5 stages */}
                            {selectedOrder.status === 'Cancelled' ? (
                                <div className="flex items-center justify-center space-x-3 py-4 px-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl mb-4">
                                    <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-sm font-black">✕</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-red-700 dark:text-red-400">Order Cancelled</p>
                                        <p className="text-xs text-red-500 dark:text-red-400">This order has been cancelled</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative pt-1">
                                    <div className="flex mb-2 items-center justify-between text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                                        {[{ label: 'Placed', active: true },
                                        { label: 'Confirmed', active: ['Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(selectedOrder.status) },
                                        { label: 'Shipped', active: ['Shipped', 'Out for Delivery', 'Delivered'].includes(selectedOrder.status) },
                                        { label: 'Out for Delivery', active: ['Out for Delivery', 'Delivered'].includes(selectedOrder.status) },
                                        { label: 'Delivered', active: selectedOrder.status === 'Delivered' }
                                        ].map((s, i) => (
                                            <span key={i} className={s.active ? 'text-brand-600' : ''}>{s.label}</span>
                                        ))}
                                    </div>
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100 dark:bg-gray-800">
                                        <div
                                            style={{
                                                width:
                                                    selectedOrder.status === 'Pending' ? '10%' :
                                                        selectedOrder.status === 'Confirmed' ? '32%' :
                                                            selectedOrder.status === 'Shipped' ? '57%' :
                                                                selectedOrder.status === 'Out for Delivery' ? '78%' : '100%'
                                            }}
                                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-brand-600 transition-all duration-1000 ease-out"
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Vertical Timeline - 5 stages */}
                            {selectedOrder.status !== 'Cancelled' && (
                                <div className="space-y-6 mt-10">
                                    {selectedOrder.trackingTimeline && selectedOrder.trackingTimeline.length > 0 ? (
                                        selectedOrder.trackingTimeline.map((step, idx, arr) => (
                                            <div key={idx} className="flex items-start relative group">
                                                {idx !== arr.length - 1 && (
                                                    <div className={`absolute left-3 top-6 w-0.5 h-full -ml-px transition-colors duration-500 bg-brand-600`}></div>
                                                )}
                                                <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-500 bg-brand-600 border-brand-600`}>
                                                    <CheckCircle className="h-4 w-4 text-white" />
                                                </div>
                                                <div className="ml-4">
                                                    <p className={`text-sm font-bold transition-colors text-gray-900 dark:text-gray-100`}>{step.status}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{step.message || 'Status updated'}</p>
                                                    {step.timestamp && <p className="text-[10px] text-gray-400 mt-0.5">{new Date(step.timestamp).toLocaleString()}</p>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        [
                                            { label: 'Order Placed', status: 'Pending', desc: 'We have received your order' },
                                            { label: 'Order Confirmed', status: 'Confirmed', desc: 'The seller has confirmed your order' },
                                            { label: 'Shipped', status: 'Shipped', desc: 'Your package is on the way' },
                                            { label: 'Out for Delivery', status: 'Out for Delivery', desc: 'Your order is out for delivery' },
                                            { label: 'Delivered', status: 'Delivered', desc: 'Package has been delivered' }
                                        ].map((step, idx, arr) => {
                                            const statusOrder = ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
                                            const currentIdx = statusOrder.indexOf(selectedOrder.status);
                                            const stepIdx = statusOrder.indexOf(step.status);
                                            const isCompleted = currentIdx >= stepIdx;

                                            return (
                                                <div key={idx} className="flex items-start relative group">
                                                    {idx !== arr.length - 1 && (
                                                        <div className={`absolute left-3 top-6 w-0.5 h-full -ml-px transition-colors duration-500 ${isCompleted ? 'bg-brand-600' : 'bg-gray-200 dark:bg-gray-800'}`}></div>
                                                    )}
                                                    <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-500 ${isCompleted ? 'bg-brand-600 border-brand-600' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'}`}>
                                                        {isCompleted ? <CheckCircle className="h-4 w-4 text-white" /> : <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800"></div>}
                                                    </div>
                                                    <div className="ml-4">
                                                        <p className={`text-sm font-bold transition-colors ${isCompleted ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>{step.label}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{step.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Return Modal */}
            {showReturnModal && selectedOrder && (
                <ReturnRequestModal
                    order={selectedOrder}
                    onClose={() => setShowReturnModal(false)}
                    onSuccess={() => {
                        fetchReturns();
                        setActiveTab('returns');
                    }}
                />
            )}
        </div >
    );
};

export default Profile;
