import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, ShoppingCart, DollarSign, Package, CreditCard } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const AnalyticsDashboard = ({ data }) => {
    if (!data) return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading analytics...</div>;

    const {
        dailySales,
        userGrowth,
        topProducts,
        topProductsByRevenue,
        salesByCategory,
        orderStatusBreakdown,
        paymentMethodDistribution,
        keyMetrics
    } = data;

    // Custom tooltip for currency values
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
                    <p className="text-gray-300 text-sm font-medium mb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
                            {entry.name}: {entry.name.includes('Revenue') || entry.name.includes('Total')
                                ? formatPrice(entry.value)
                                : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Key Metrics Cards */}
            {keyMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign className="h-8 w-8 opacity-80" />
                            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Total Revenue</span>
                        </div>
                        <p className="text-3xl font-black">{formatPrice(keyMetrics.totalRevenue)}</p>
                        <p className="text-xs mt-1 opacity-80">From {keyMetrics.totalOrders} orders</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                            <ShoppingCart className="h-8 w-8 opacity-80" />
                            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Avg Order Value</span>
                        </div>
                        <p className="text-3xl font-black">{formatPrice(keyMetrics.averageOrderValue)}</p>
                        <p className="text-xs mt-1 opacity-80">Per transaction</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                            <Package className="h-8 w-8 opacity-80" />
                            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Completion Rate</span>
                        </div>
                        <p className="text-3xl font-black">{keyMetrics.completionRate}%</p>
                        <p className="text-xs mt-1 opacity-80">{keyMetrics.completedOrders} delivered</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="h-8 w-8 opacity-80" />
                            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Cancellation Rate</span>
                        </div>
                        <p className="text-3xl font-black">{keyMetrics.cancellationRate}%</p>
                        <p className="text-xs mt-1 opacity-80">{keyMetrics.cancelledOrders} cancelled</p>
                    </div>
                </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Sales Chart */}
                {dailySales && dailySales.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border dark:border-gray-800">
                        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-gray-100">Daily Sales (Last 30 Days)</h3>
                        <div className="h-64 w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailySales}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                                    <XAxis dataKey="_id" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="total" name="Revenue" stroke="#4F46E5" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* User Growth Chart */}
                {userGrowth && userGrowth.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border dark:border-gray-800">
                        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-gray-100">User Growth (Last 30 Days)</h3>
                        <div className="h-64 w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={userGrowth}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                                    <XAxis dataKey="_id" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="count" name="New Users" stroke="#10B981" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Top Products by Revenue */}
                {topProductsByRevenue && topProductsByRevenue.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border dark:border-gray-800">
                        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-gray-100">Top Products by Revenue</h3>
                        <div className="h-64 w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProductsByRevenue} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                                    <XAxis type="number" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis type="category" dataKey="_id" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} width={120} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="revenue" name="Revenue" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Top Products by Quantity */}
                {topProducts && topProducts.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border dark:border-gray-800">
                        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-gray-100">Top Products by Quantity Sold</h3>
                        <div className="h-64 w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProducts}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                                    <XAxis dataKey="_id" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="sales" name="Units Sold" fill="#10B981" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Sales by Category */}
                {salesByCategory && salesByCategory.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border dark:border-gray-800">
                        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-gray-100">Sales by Category</h3>
                        <div className="h-64 w-full min-w-0 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={salesByCategory}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="_id"
                                    >
                                        {salesByCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Order Status Breakdown */}
                {orderStatusBreakdown && orderStatusBreakdown.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border dark:border-gray-800">
                        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-gray-100">Order Status Distribution</h3>
                        <div className="h-64 w-full min-w-0 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={orderStatusBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ _id, percent }) => `${_id}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                        nameKey="_id"
                                    >
                                        {orderStatusBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Payment Method Distribution */}
                {paymentMethodDistribution && paymentMethodDistribution.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border dark:border-gray-800 lg:col-span-2">
                        <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-gray-100">Payment Method Distribution</h3>
                        <div className="h-64 w-full min-w-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={paymentMethodDistribution.map(item => ({
                                    name: item._id.subMethod
                                        ? `${item._id.method} (${item._id.subMethod.toUpperCase()})`
                                        : item._id.method,
                                    count: item.count,
                                    revenue: item.revenue
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="left" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="count" name="Order Count" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                                    <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
