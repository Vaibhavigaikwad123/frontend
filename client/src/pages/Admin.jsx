import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Package, Users, ShoppingCart, TrendingUp, Plus, Edit, Trash2, X, Star, MessageSquare, AlertTriangle, BarChart3, RefreshCw, Undo2, CheckCircle2, Moon, Sun, LogOut } from 'lucide-react';
import Button from '../components/ui/Button';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { API_URL } from '../utils/api';
import { getImageUrl } from '../utils/imageHelper';
import { formatPrice } from '../utils/formatPrice';

const SERVER_URL = API_URL.replace('/api', '');

const Admin = () => {
    const { user, logout } = useAuth();
    const { addToast } = useToast();
    const { darkMode, toggleDarkMode } = useTheme();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [returns, setReturns] = useState([]);
    const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, revenue: 0, totalUsers: 0, lowStockCount: 0 });
    const [analyticsData, setAnalyticsData] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '', description: '', price: '', category: '', subcategory: '', brand: '', stock: '', images: [], featured: false
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'returns', label: 'Returns', icon: Undo2 },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'reviews', label: 'Reviews', icon: MessageSquare }
    ];

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchProducts();
            fetchOrders();
            fetchUsers();
            fetchReviews();
            fetchReturns();
            fetchAnalytics();
        }
    }, [user]);

    useEffect(() => {
        calculateStats();
    }, [products, orders]);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchOrders = async () => {
        try {
            // Admins should get all orders
            const res = await api.get('/orders/all');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users/all');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await api.get('/reviews/all');
            setReviews(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchReturns = async () => {
        try {
            const res = await api.get('/returns/admin/all');
            setReturns(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAnalytics = async (isManual = false) => {
        if (isManual) setIsRefreshing(true);
        try {
            const res = await api.get('/analytics');
            setAnalyticsData(res.data);
            if (isManual) addToast('Analytics data refreshed', 'success');
        } catch (err) {
            console.error(err);
            if (isManual) addToast('Failed to refresh analytics', 'error');
        } finally {
            if (isManual) setIsRefreshing(false);
        }
    };


    const calculateStats = () => {
        const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const lowStockCount = products.filter(p => p.stock <= 10).length;
        setStats({ totalProducts: products.length, totalOrders: orders.length, revenue, totalUsers: users.length, lowStockCount });
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', productForm.name);
            formData.append('description', productForm.description);
            formData.append('price', productForm.price);
            formData.append('category', productForm.category);
            formData.append('subcategory', productForm.subcategory);
            formData.append('brand', productForm.brand);
            formData.append('stock', productForm.stock);
            formData.append('featured', productForm.featured);

            // Append existing images (URLs)
            if (productForm.images && productForm.images.length > 0) {
                productForm.images.forEach(img => formData.append('images', img));
            }

            // Append new image files
            if (imageFiles && imageFiles.length > 0) {
                imageFiles.forEach(file => formData.append('images', file));
            }

            if (editingProduct) {
                await api.put(`/products/${editingProduct._id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                addToast('Product updated successfully', 'success');
            } else {
                await api.post('/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                addToast('Product created successfully', 'success');
            }

            fetchProducts();
            setShowProductModal(false);
            resetProductForm();
        } catch (err) {
            console.error(err);
            addToast('Error saving product', 'error');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            addToast('Product deleted', 'success');
            fetchProducts();
        } catch (err) {
            addToast('Error deleting product', 'error');
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            subcategory: product.subcategory || '',
            brand: product.brand || '',
            stock: product.stock,
            images: product.images || [],
            featured: product.featured || false
        });
        setImageFiles([]); // Reset new files
        setShowProductModal(true);
    };

    const resetProductForm = () => {
        setEditingProduct(null);
        setProductForm({ name: '', description: '', price: '', category: '', subcategory: '', brand: '', stock: '', images: [], featured: false });
        setImageFiles([]);
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}`, { status: newStatus });
            addToast('Order status updated', 'success');
            fetchOrders();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error updating order';
            addToast(errorMessage, 'error');
            console.error('Order status update error:', err.response?.data);
        }
    };

    const handleDeleteReview = async (id) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        try {
            await api.delete(`/reviews/${id}`);
            addToast('Review deleted', 'success');
            fetchReviews();
        } catch (err) {
            addToast('Error deleting review', 'error');
        }
    };

    const handleUpdateReturnStatus = async (returnId, status, notes) => {
        try {
            await api.put(`/returns/admin/${returnId}`, { status, adminNotes: notes });
            addToast('Return request updated', 'success');
            fetchReturns();
            setShowReturnModal(false);
        } catch (err) {
            addToast('Error updating return request', 'error');
        }
    };


    if (!user || user.role !== 'admin') {
        return <div className="p-20 text-center text-red-500">Access Denied. Admin only.</div>;
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 flex flex-col md:flex-row ${darkMode ? 'bg-gray-950' : 'bg-white'}`}>
            {/* Sidebar Navigation */}
            <aside className={`w-full md:w-64 border-b md:border-b-0 md:border-r transition-colors duration-300 flex-shrink-0 z-20 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                <div className="sticky top-0 p-6 flex flex-col h-screen">
                    <div className="flex items-center space-x-3 mb-8">
                        <div className="h-10 w-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <h1 className={`text-xl font-bold transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Admin Panel</h1>
                    </div>

                    <nav className="space-y-1 flex-1">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all group ${activeTab === item.id
                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                            >
                                <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-brand-600'}`} />
                                <span className="capitalize">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Theme Toggle & User Info */}
                    <div className="pt-4 mt-4 border-t dark:border-gray-800 space-y-3">
                        {/* Theme Toggle */}
                        <div className="flex items-center justify-between px-4 py-3">
                            <div className={`flex items-center space-x-3 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                                <span className="font-bold text-sm tracking-wide uppercase">
                                    {darkMode ? 'Dark Mode' : 'Sunlight Mode'}
                                </span>
                            </div>
                            <ToggleSwitch checked={darkMode} onChange={toggleDarkMode} />
                        </div>

                        {/* User Profile */}
                        <div className={`flex items-center space-x-3 px-4 py-3 transition-colors ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl`}>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${darkMode ? 'bg-brand-900/20 text-brand-400' : 'bg-brand-100 text-brand-700'}`}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium transition-colors truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{user?.name}</p>
                                <p className={`text-xs transition-colors truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Admin</p>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={() => {
                                logout();
                                addToast('Logged out successfully', 'success');
                            }}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all bg-brand-600 text-white hover:bg-brand-700 shadow-md shadow-brand-500/20"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <header className="mb-8 flex justify-between items-center px-2">
                    <div>
                        <h2 className={`text-2xl font-bold transition-colors capitalize ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{activeTab}</h2>
                        <p className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Manage your store {activeTab} here</p>
                    </div>
                    <div className={`p-2 rounded-xl border text-xs font-semibold shadow-sm transition-colors hidden sm:block ${darkMode ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-gray-100 text-gray-600'}`}>
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </header>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className={`p-6 rounded-lg shadow-sm border-b-4 border-brand-600 transition-colors ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Products</p>
                                        <p className={`text-3xl font-bold mt-2 transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>{stats.totalProducts}</p>
                                    </div>
                                    <Package className="h-10 w-10 text-brand-600 opacity-20" />
                                </div>
                            </div>
                            <div className={`p-6 rounded-lg shadow-sm border-b-4 border-blue-600 transition-colors ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Orders</p>
                                        <p className={`text-3xl font-bold mt-2 transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>{stats.totalOrders}</p>
                                    </div>
                                    <ShoppingCart className="h-10 w-10 text-blue-600 opacity-20" />
                                </div>
                            </div>
                            <div className={`p-6 rounded-lg shadow-sm border-b-4 border-green-600 transition-colors ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Customers</p>
                                        <p className={`text-3xl font-bold mt-2 transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>{stats.totalUsers}</p>
                                    </div>
                                    <Users className="h-10 w-10 text-green-600 opacity-20" />
                                </div>
                            </div>
                            <div className={`p-6 rounded-lg shadow-sm border-b-4 border-purple-600 transition-colors ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Revenue</p>
                                        <p className={`text-2xl font-bold mt-2 transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>{formatPrice(stats.revenue)}</p>
                                    </div>
                                    <TrendingUp className="h-10 w-10 text-purple-600 opacity-20" />
                                </div>
                            </div>
                            <div className={`p-6 rounded-lg shadow-sm border-b-4 transition-colors ${stats.lowStockCount > 0 ? 'border-red-600' : darkMode ? 'border-gray-800' : 'border-gray-100'} ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Low Stock</p>
                                        <p className={`text-3xl font-bold mt-2 transition-colors ${stats.lowStockCount > 0 ? (darkMode ? 'text-red-400' : 'text-red-600') : (darkMode ? 'text-gray-400' : 'text-gray-400')}`}>{stats.lowStockCount}</p>
                                    </div>
                                    <AlertTriangle className={`h-10 w-10 ${stats.lowStockCount > 0 ? 'text-red-600 opacity-20' : 'text-gray-300 opacity-20'}`} />
                                </div>
                            </div>
                        </div>

                        {/* Analytics Charts */}
                        <div className={`p-6 rounded-lg shadow-sm border transition-colors ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className={`font-bold text-xl flex items-center transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                    <BarChart3 className="h-6 w-6 mr-2 text-brand-600" />
                                    Analytics Overview
                                </h3>
                                <Button
                                    onClick={() => fetchAnalytics(true)}
                                    variant="outline"
                                    size="sm"
                                    isLoading={isRefreshing}
                                >
                                    Refresh Data
                                </Button>
                            </div>
                            <AnalyticsDashboard data={analyticsData} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Low Stock Alerts */}
                            <div className={`p-6 rounded-lg shadow-sm border transition-colors ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                <h3 className={`font-bold text-lg mb-4 flex items-center transition-colors ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                                    <AlertTriangle className="h-5 w-5 mr-2" />
                                    Low Stock Alerts
                                </h3>
                                <div className="space-y-3">
                                    {products.filter(p => p.stock <= 10).slice(0, 5).map(product => (
                                        <div key={product._id} className={`flex justify-between items-center border-b pb-3 transition-colors ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-8 h-8 rounded transition-colors ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                                    {product.images?.[0] && <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover rounded" />}
                                                </div>
                                                <p className={`font-medium text-sm transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{product.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-bold transition-colors ${product.stock === 0 ? (darkMode ? 'text-red-400' : 'text-red-600') : (darkMode ? 'text-orange-400' : 'text-orange-600')}`}>{product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}</p>
                                                <button onClick={() => handleEditProduct(product)} className={`text-xs hover:underline ${darkMode ? 'text-brand-400' : 'text-brand-600'}`}>Update Stock</button>
                                            </div>
                                        </div>
                                    ))}
                                    {products.filter(p => p.stock <= 10).length === 0 && (
                                        <p className={`text-sm italic transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No low stock items. All good!</p>
                                    )}
                                    {products.filter(p => p.stock <= 10).length > 5 && (
                                        <button onClick={() => setActiveTab('products')} className={`w-full text-center text-sm mt-2 transition-colors ${darkMode ? 'text-gray-400 hover:text-brand-400' : 'text-gray-500 hover:text-brand-600'}`}>View all low stock items</button>
                                    )}
                                </div>
                            </div>

                            <div className={`p-6 rounded-lg shadow-sm border transition-colors ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                <h3 className={`font-bold text-lg mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Recent Orders</h3>
                                <div className="space-y-3">
                                    {orders.slice(0, 5).map(order => (
                                        <div key={order._id} className={`flex justify-between items-center border-b pb-3 transition-colors ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                            <div>
                                                <p className={`font-medium text-sm transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Order #{order._id.slice(-8)}</p>
                                                <p className={`text-xs transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-semibold transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>{formatPrice(order.totalAmount)}</p>
                                                <span className={`text-xs px-2 py-1 rounded border transition-colors ${order.status === 'Delivered' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className={`text-2xl font-bold transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>Products</h2>
                            <Button onClick={() => { resetProductForm(); setShowProductModal(true); }} className="flex items-center space-x-2">
                                <Plus className="h-4 w-4" /> <span>Add Product</span>
                            </Button>
                        </div>

                        <div className={`rounded-lg shadow-sm border overflow-hidden transition-colors ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                            <table className={`min-w-full divide-y transition-colors ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                                <thead className={`transition-colors ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
                                    <tr>
                                        <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Product</th>
                                        <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Category</th>
                                        <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Price</th>
                                        <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Stock</th>
                                        <th className={`px-6 py-3 text-left text-xs font-bold uppercase tracking-wider transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y transition-colors ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                                    {products.map(product => (
                                        <tr key={product._id} className={`transition-colors ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-10 h-10 rounded border transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-100'}`}>
                                                        {product.images?.[0] && <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover rounded" />}
                                                    </div>
                                                    <span className={`font-medium text-sm transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{product.name}</span>
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{product.category}</td>
                                            <td className={`px-6 py-4 text-sm font-semibold transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>{formatPrice(product.price)}</td>
                                            <td className={`px-6 py-4 text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <div className="flex items-center">
                                                    {product.stock}
                                                    {product.stock <= 10 && (
                                                        <AlertTriangle className={`h-4 w-4 ml-2 transition-colors ${product.stock === 0 ? (darkMode ? 'text-red-400' : 'text-red-500') : (darkMode ? 'text-orange-400' : 'text-orange-500')}`} />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <button onClick={() => handleEditProduct(product)} className={`transition-colors ${darkMode ? 'text-brand-400 hover:text-brand-300' : 'text-brand-600 hover:text-brand-700'}`}>
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteProduct(product._id)} className={`transition-colors ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'}`}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div>
                        <h2 className={`text-2xl font-bold mb-6 transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>Orders</h2>
                        <div className="space-y-4">
                            {orders.map(order => (
                                <div key={order._id}
                                    onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                                    className={`p-6 rounded-lg shadow-sm border transition-all hover:shadow-md cursor-pointer group ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className={`font-bold group-hover:text-brand-600 transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>Order #{order._id}</p>
                                            <p className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(order.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <p className={`font-bold text-lg transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>{formatPrice(order.totalAmount)}</p>
                                            {/* Status dropdown — only shows the next valid transition */}
                                            {['Delivered', 'Cancelled', 'Returned', 'Refunded'].includes(order.status) ? (
                                                <span className={`mt-2 inline-block text-xs font-bold px-3 py-1 rounded-full border transition-colors
                                                    ${order.status === 'Delivered' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' :
                                                        order.status === 'Cancelled' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
                                                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}>
                                                    {order.status}
                                                </span>
                                            ) : (() => {
                                                const allStatuses = ['Pending', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
                                                const currentIdx = allStatuses.indexOf(order.status);
                                                const forwardStatuses = allStatuses.slice(currentIdx);
                                                return (
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                                        className={`mt-2 text-xs font-semibold border rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-brand-500 transition-colors cursor-pointer
                                                            ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-300 bg-white text-gray-900'}`}
                                                    >
                                                        {forwardStatuses.map(s => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                        <option value="Cancelled">Cancelled</option>
                                                    </select>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                    <div className={`text-sm transition-colors flex justify-between items-end ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        <div>
                                            <p><strong className={darkMode ? 'text-gray-200' : 'text-gray-800'}>Customer:</strong> {order.user?.name || 'Guest'}</p>
                                            <p><strong className={darkMode ? 'text-gray-200' : 'text-gray-800'}>Payment:</strong> {order.paymentMethod} {order.paymentSubMethod ? `(${order.paymentSubMethod.toUpperCase()})` : ''}</p>
                                            <p><strong className={darkMode ? 'text-gray-200' : 'text-gray-800'}>Shipping:</strong> {order.shippingAddress.city}, {order.shippingAddress.state}</p>
                                        </div>
                                        <p className="text-xs text-brand-600 font-semibold group-hover:underline">View Details →</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Returns Tab */}
                {activeTab === 'returns' && (
                    <div>
                        <h2 className={`text-2xl font-bold mb-6 transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>Returns & Exchanges</h2>
                        <div className="space-y-4">
                            {returns.length === 0 ? (
                                <p className={`italic transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>No active return requests.</p>
                            ) : (
                                returns.map(ret => (
                                    <div key={ret._id} className={`p-6 rounded-lg shadow-sm border hover:shadow-md transition-all ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-start space-x-4">
                                                <div className={`p-3 rounded-full transition-colors ${ret.type === 'Exchange' ? (darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600') : (darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600')}`}>
                                                    {ret.type === 'Exchange' ? <RefreshCw className="h-6 w-6" /> : <Undo2 className="h-6 w-6" />}
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold text-lg transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{ret.type} Request</h3>
                                                    <p className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>From Order #{ret.order?._id?.slice(-8).toUpperCase()}</p>
                                                    <p className={`text-xs mt-1 transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                        Requested on {new Date(ret.createdAt).toLocaleDateString()} by <span className={`font-semibold transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{ret.user?.name || 'Unknown User'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border uppercase tracking-wide transition-colors
                                                    ${ret.status === 'Completed' ? 'bg-green-100 border-green-200 text-green-700' :
                                                        ret.status === 'Rejected' ? 'bg-red-100 border-red-200 text-red-700' :
                                                            'bg-amber-50 border-amber-200 text-amber-700'}`}>
                                                    {ret.status}
                                                </span>
                                                <button
                                                    onClick={() => { setSelectedReturn(ret); setShowReturnModal(true); }}
                                                    className={`block mt-3 text-sm font-semibold ml-auto transition-colors ${darkMode ? 'text-brand-400 hover:underline' : 'text-brand-600 hover:underline'}`}
                                                >
                                                    Manage Request
                                                </button>
                                            </div>
                                        </div>

                                        <div className={`p-4 rounded-xl border transition-colors ${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                                            <div className="space-y-3">
                                                {ret.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`h-10 w-10 rounded border overflow-hidden transition-colors ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                                                                <img src={getImageUrl(item.image || item.product?.images?.[0])} alt={item.name} className="h-full w-full object-cover" />
                                                            </div>
                                                            <span className={`font-medium transition-colors ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.name || item.product?.name}</span>
                                                        </div>
                                                        <span className={`text-sm font-mono transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Qty: {item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className={`mt-4 pt-4 border-t flex justify-between items-start transition-colors ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                                <div className="flex-1">
                                                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Reason</p>
                                                    <p className={`text-sm italic transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>"{ret.reason}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Customers Tab */}
                {activeTab === 'customers' && (
                    <div>
                        <h2 className={`text-2xl font-bold mb-6 transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>Customers</h2>
                        <div className={`rounded-xl shadow-sm border overflow-hidden transition-colors ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                            <table className={`min-w-full divide-y transition-colors ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                                <thead className={`transition-colors ${darkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
                                    <tr>
                                        <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Customer</th>
                                        <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Joined</th>
                                        <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Role</th>
                                        <th className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Provider</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y transition-colors ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                                    {users.map(u => (
                                        <tr key={u._id} className={`transition-colors ${darkMode ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold border transition-colors ${darkMode ? 'bg-brand-900/20 text-brand-400 border-brand-800' : 'bg-brand-100 text-brand-700 border-brand-200'}`}>
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className={`text-sm font-semibold transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{u.name}</div>
                                                        <div className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full transition-colors ${u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800' : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm capitalize transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {u.authProvider}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                    <div>
                        <h2 className={`text-2xl font-bold mb-6 transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>Reviews</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.length === 0 ? (
                                <div className={`col-span-full py-12 text-center rounded-xl border border-dashed transition-colors ${darkMode ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-gray-100 text-gray-500'}`}>
                                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    No reviews yet.
                                </div>
                            ) : (
                                reviews.map(r => (
                                    <div key={r._id} className={`p-5 rounded-xl shadow-sm border group hover:shadow-md transition-all ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className={`font-bold line-clamp-1 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{r.product?.name || 'Unknown Product'}</h4>
                                                <div className="flex items-center mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`h-3 w-3 ${i < r.rating ? 'text-yellow-400 fill-current' : (darkMode ? 'text-gray-800' : 'text-gray-200')}`} />
                                                    ))}
                                                    <span className={`text-xs ml-2 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(r.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDeleteReview(r._id)} className={`p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}>
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className={`text-sm italic p-3 rounded-lg mb-4 transition-colors ${darkMode ? 'text-gray-400 bg-gray-950' : 'text-gray-600 bg-gray-50'}`}>"{r.comment}"</p>
                                        <div className={`flex items-center pt-2 border-t transition-colors ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                            <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-[10px] transition-colors ${darkMode ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                                                {r.user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-2">
                                                <p className={`text-xs font-semibold transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{r.user?.name}</p>
                                                <p className={`text-xs transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{r.user?.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Product Modal */}
                {showProductModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
                        <div className={`rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-colors ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className={`text-xl font-bold transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>
                                        {editingProduct ? 'Edit Product' : 'Add Product'}
                                    </h3>
                                    <button onClick={() => setShowProductModal(false)} className={`transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                                <form onSubmit={handleProductSubmit} className={`space-y-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <input type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className={`w-full px-3 py-2 border rounded transition-colors outline-none focus:ring-1 focus:ring-brand-500 ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Description</label>
                                        <textarea required value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} className={`w-full px-3 py-2 border rounded transition-colors outline-none focus:ring-1 focus:ring-brand-500 ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`} rows="3" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Price (₹)</label>
                                            <input type="number" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className={`w-full px-3 py-2 border rounded transition-colors outline-none focus:ring-1 focus:ring-brand-500 ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Stock</label>
                                            <input type="number" required value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className={`w-full px-3 py-2 border rounded transition-colors outline-none focus:ring-1 focus:ring-brand-500 ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Category</label>
                                            <select required value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className={`w-full px-3 py-2 border rounded transition-colors outline-none focus:ring-1 focus:ring-brand-500 ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`}>
                                                <option value="">Select</option>
                                                <option value="School Supplies">School Supplies</option>
                                                <option value="Art And Craft">Art And Craft</option>
                                                <option value="Office Supplies">Office Supplies</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Brand</label>
                                            <input type="text" value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} className={`w-full px-3 py-2 border rounded transition-colors outline-none focus:ring-1 focus:ring-brand-500 ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Product Images</label>

                                        {/* Existing Images */}
                                        {productForm.images && productForm.images.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {productForm.images.map((img, idx) => (
                                                    <div key={idx} className="relative w-20 h-20 group">
                                                        <img src={getImageUrl(img)} alt="Product" className="w-full h-full object-cover rounded border dark:border-gray-700" />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newImages = productForm.images.filter((_, i) => i !== idx);
                                                                setProductForm({ ...productForm, images: newImages });
                                                            }}
                                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* New File Input */}
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center hover:border-brand-500 dark:hover:border-brand-500 transition-colors">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files);
                                                    setImageFiles([...imageFiles, ...files]);
                                                }}
                                                className="hidden"
                                                id="image-upload"
                                            />
                                            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center">
                                                <Package className="h-8 w-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload images</span>
                                            </label>
                                        </div>

                                        {/* New Image Previews */}
                                        {imageFiles.length > 0 && (
                                            <div className="mt-2 space-y-2">
                                                <p className="text-xs text-gray-500">New uploads:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {imageFiles.map((file, idx) => (
                                                        <div key={idx} className="relative w-20 h-20 group">
                                                            <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover rounded border dark:border-gray-700" />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newFiles = imageFiles.filter((_, i) => i !== idx);
                                                                    setImageFiles(newFiles);
                                                                }}
                                                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input type="checkbox" checked={productForm.featured} onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })} className={`rounded transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`} />
                                        <label className={`text-sm transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Featured Product</label>
                                    </div>
                                    <div className="flex space-x-3 pt-4">
                                        <Button type="submit" className="flex-1">{editingProduct ? 'Update' : 'Create'}</Button>
                                        <button type="button" onClick={() => setShowProductModal(false)} className={`flex-1 px-4 py-2 border rounded transition-colors ${darkMode ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
                {/* Order Details Modal */}
                {showOrderModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                        <div className={`rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col transition-colors ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                            {/* Header */}
                            <div className={`p-6 border-b flex justify-between items-center transition-colors ${darkMode ? 'border-gray-800 bg-gray-950/50' : 'border-gray-100 bg-gray-50'}`}>
                                <div>
                                    <h3 className={`text-xl font-bold transition-colors ${darkMode ? 'text-gray-50' : 'text-gray-900'}`}>Order Details</h3>
                                    <p className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>#{selectedOrder._id}</p>
                                </div>
                                <button onClick={() => setShowOrderModal(false)} className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8 text-gray-900 dark:text-gray-100">
                                {/* Grid for User and Order Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Customer & Payment */}
                                    <div className="space-y-6">
                                        <section>
                                            <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Customer Information</h4>
                                            <div className={`space-y-2 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                                <p className="font-medium">{selectedOrder.user?.name || 'Guest User'}</p>
                                                <p className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedOrder.user?.email}</p>
                                                <p className={`text-sm flex items-center transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    <span className="font-semibold mr-2">Phone:</span>
                                                    {selectedOrder.shippingAddress?.phone || 'Not provided'}
                                                </p>
                                            </div>
                                        </section>

                                        <section>
                                            <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Payment Details</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className={`text-sm transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Method</span>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`text-sm font-semibold transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedOrder.paymentMethod}</span>
                                                        {selectedOrder.paymentSubMethod && (
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border transition-colors ${darkMode ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                                {selectedOrder.paymentSubMethod}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500">Paid</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${(selectedOrder.paymentMethod !== 'COD' || selectedOrder.status === 'Delivered') ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                                        {(selectedOrder.paymentMethod !== 'COD' || selectedOrder.status === 'Delivered') ? 'YES' : 'NO'}
                                                    </span>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Shipping & Timing */}
                                    <div className="space-y-6">
                                        <section>
                                            <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Shipping Address</h4>
                                            <div className={`text-sm leading-relaxed transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                <p className={`font-medium transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{selectedOrder.shippingAddress?.street}</p>
                                                <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                                                <p>{selectedOrder.shippingAddress?.zip}, {selectedOrder.shippingAddress?.country}</p>
                                            </div>
                                        </section>

                                        <section>
                                            <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Order Timeline</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className={`text-sm transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Placed on</span>
                                                    <span className={`text-sm transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {new Date(selectedOrder.createdAt).toLocaleDateString()} at {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className={`text-sm transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Last Status</span>
                                                    <span className="text-sm font-bold text-brand-600">{selectedOrder.status}</span>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <section>
                                    <h4 className={`text-xs font-bold uppercase tracking-widest mb-4 transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Order Items</h4>
                                    <div className={`border rounded-xl overflow-hidden transition-colors ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                                        <table className={`min-w-full divide-y transition-colors ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                                            <thead className={`transition-colors ${darkMode ? 'bg-gray-950/50' : 'bg-gray-50'}`}>
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase">Product</th>
                                                    <th className="px-4 py-3 text-center text-[10px] font-bold text-gray-400 uppercase">Qty</th>
                                                    <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase">Price</th>
                                                    <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className={`divide-y transition-colors ${darkMode ? 'divide-gray-800' : 'divide-gray-100'}`}>
                                                {selectedOrder.items.map((item, idx) => (
                                                    <tr key={idx} className="text-sm">
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center space-x-3">
                                                                <div className={`h-10 w-10 rounded overflow-hidden flex-shrink-0 transition-colors ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                                                    {(item.product?.images?.[0] || item.image) ? (
                                                                        <img src={getImageUrl(item.product?.images?.[0] || item.image)} alt={item.product?.name || item.name} className="h-full w-full object-cover" />
                                                                    ) : <Package className="h-4 w-4 m-3 text-gray-300" />}
                                                                </div>
                                                                <span className={`font-medium line-clamp-1 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.product?.name || item.name || 'Removed Product'}</span>
                                                            </div>
                                                        </td>
                                                        <td className={`px-4 py-3 text-center transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.quantity}</td>
                                                        <td className={`px-4 py-3 text-right transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{formatPrice(item.price)}</td>
                                                        <td className={`px-4 py-3 text-right font-bold transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatPrice(item.price * item.quantity)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>

                                {/* Totals Summary */}
                                <div className={`p-4 rounded-xl flex justify-between items-center border transition-colors ${darkMode ? 'bg-brand-900/10 border-brand-900/20' : 'bg-brand-50 border-brand-100'}`}>
                                    <span className={`font-bold uppercase text-xs tracking-widest transition-colors ${darkMode ? 'text-brand-400' : 'text-brand-900'}`}>Grand Total</span>
                                    <span className={`text-2xl font-black transition-colors ${darkMode ? 'text-brand-400' : 'text-brand-700'}`}>{formatPrice(selectedOrder.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Return Details Modal */}
                {showReturnModal && selectedReturn && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                        <div className={`rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col transition-colors ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                            <div className={`p-6 border-b flex justify-between items-center transition-colors ${darkMode ? 'border-gray-800 bg-gray-950/50' : 'border-gray-100 bg-gray-50'}`}>
                                <h3 className={`text-xl font-bold transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Manage Return Request</h3>
                                <button onClick={() => setShowReturnModal(false)} className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[80vh] space-y-6">
                                <div>
                                    <h4 className={`text-xs font-bold uppercase tracking-widest mb-2 transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Items to Return</h4>
                                    <div className="space-y-2">
                                        {selectedReturn.items.map((item, idx) => (
                                            <div key={idx} className={`flex items-center space-x-3 p-2 border rounded-lg transition-colors ${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                                                <div className={`h-10 w-10 rounded overflow-hidden transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                                    <img src={getImageUrl(item.image || item.product?.images?.[0])} alt={item.name} className="h-full w-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`font-bold text-sm transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.name || item.product?.name}</p>
                                                    <p className={`text-xs transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className={`text-xs font-bold uppercase tracking-widest mb-2 transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Customer Reason</h4>
                                    <div className={`p-3 rounded-xl border text-sm italic transition-colors ${darkMode ? 'bg-gray-950 border-gray-800 text-gray-300' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                                        "{selectedReturn.reason}"
                                    </div>
                                </div>


                                <div>
                                    <h4 className={`text-xs font-bold uppercase tracking-widest mb-2 transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Update Status</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <select
                                            defaultValue={selectedReturn.status}
                                            id="admin-return-status"
                                            className={`w-full px-4 py-2 rounded-xl border transition-colors outline-none focus:ring-1 focus:ring-brand-500 ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Approved">Approved</option>
                                            <option value="Picked Up">Picked Up</option>
                                            <option value="Received">Received</option>
                                            <option value="Inspected">Inspected</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                        <div className={`flex items-center text-xs p-2 rounded-lg border transition-colors ${darkMode ? 'text-amber-400 bg-amber-900/10 border-amber-900/20' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                                            <AlertTriangle className="h-4 w-4 mr-2" />
                                            Changing status will notify the user.
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className={`text-xs font-bold uppercase tracking-widest mb-2 transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>Admin Notes (Visible to User)</h4>
                                    <textarea
                                        id="admin-return-notes"
                                        defaultValue={selectedReturn.adminNotes}
                                        placeholder="Add notes about return inspection, pickup timing, etc."
                                        className={`w-full h-24 px-4 py-2 rounded-xl border resize-none outline-none focus:ring-2 focus:ring-brand-500 transition-colors ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-100' : 'border-gray-200 bg-white text-gray-900'}`}
                                    ></textarea>
                                </div>
                            </div>
                            <div className={`p-6 border-t flex space-x-3 transition-colors ${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                                <Button variant="secondary" onClick={() => setShowReturnModal(false)} className="flex-1">Cancel</Button>
                                <Button
                                    onClick={() => {
                                        const status = document.getElementById('admin-return-status').value;
                                        const notes = document.getElementById('admin-return-notes').value;
                                        handleUpdateReturnStatus(selectedReturn._id, status, notes);
                                    }}
                                    className="flex-[2]"
                                >
                                    Update Request
                                </Button>
                            </div>
                        </div >
                    </div >
                )}
            </main>
        </div>
    );
};

export default Admin;
