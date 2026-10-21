const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { requireAdmin } = auth;

// Get analytics data (Admin only)
router.get('/', auth, requireAdmin, async (req, res) => {
    try {
        // 1. User Growth (Daily registrations - last 30 days)
        const userGrowth = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 2. Daily Sales (Revenue - last 30 days)
        const dailySales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
                    status: { $nin: ['Cancelled'] }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$totalAmount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 3. Top Products (By quantity sold)
        const topProducts = await Order.aggregate([
            { $match: { status: { $nin: ['Cancelled'] } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.name",
                    sales: { $sum: "$items.quantity" }
                }
            },
            { $sort: { sales: -1 } },
            { $limit: 5 }
        ]);

        // 4. Top Products by Revenue
        const topProductsByRevenue = await Order.aggregate([
            { $match: { status: { $nin: ['Cancelled'] } } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.name",
                    revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
                    quantity: { $sum: "$items.quantity" }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 }
        ]);

        // 5. Sales by Category
        const salesByCategory = await Order.aggregate([
            { $match: { status: { $nin: ['Cancelled'] } } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$productDetails.category",
                    value: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
                }
            }
        ]);

        // 6. Order Status Breakdown
        const orderStatusBreakdown = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 7. Payment Method Distribution
        const paymentMethodDistribution = await Order.aggregate([
            {
                $group: {
                    _id: {
                        method: "$paymentMethod",
                        subMethod: "$paymentSubMethod"
                    },
                    count: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // 8. Key Metrics
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $nin: ['Cancelled'] } } },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const averageOrderValue = totalRevenue.length > 0
            ? totalRevenue[0].total / totalRevenue[0].count
            : 0;

        const totalOrders = await Order.countDocuments();
        const completedOrders = await Order.countDocuments({ status: 'Delivered' });
        const cancelledOrders = await Order.countDocuments({ status: 'Cancelled' });

        res.json({
            userGrowth,
            dailySales,
            topProducts,
            topProductsByRevenue,
            salesByCategory,
            orderStatusBreakdown,
            paymentMethodDistribution,
            keyMetrics: {
                totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
                averageOrderValue,
                totalOrders,
                completedOrders,
                cancelledOrders,
                cancellationRate: totalOrders > 0 ? (cancelledOrders / totalOrders * 100).toFixed(2) : 0,
                completionRate: totalOrders > 0 ? (completedOrders / totalOrders * 100).toFixed(2) : 0
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

