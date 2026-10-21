import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Calendar, CreditCard, Download, Home } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Success = () => {
    const location = useLocation();
    const order = location.state?.order;

    const downloadInvoice = () => {
        if (!order) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text('INVOICE', 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Order ID: #${order._id.toUpperCase()}`, 15, 30);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 15, 35);
        doc.text(`Payment: ${order.paymentMethod}${order.paymentSubMethod ? ` (${order.paymentSubMethod.toUpperCase()})` : ''}`, 15, 40);
        doc.text(`Paid: ${(order.paymentMethod !== 'COD' || order.status === 'Delivered') ? 'YES' : 'NO'}`, 15, 45);

        // Shipping Address
        doc.setFontSize(12);
        doc.text('Shipping Address:', 15, 60);
        doc.setFontSize(10);
        doc.text(`${order.shippingAddress.street}`, 15, 65);
        doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}`, 15, 70);
        doc.text(`${order.shippingAddress.country}`, 15, 75);
        if (order.shippingAddress.phone) doc.text(`Phone: ${order.shippingAddress.phone}`, 15, 80);

        // Table
        const tableColumn = ["Product", "Quantity", "Price", "Total"];
        const tableRows = [];

        order.items.forEach(item => {
            const itemData = [
                item.product?.name || item.name || 'Product',
                item.quantity,
                `Rs. ${item.price.toFixed(2)}`,
                `Rs. ${(item.price * item.quantity).toFixed(2)}`
            ];
            tableRows.push(itemData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 90,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] } // Brand colorish
        });

        // Summary
        const finalY = doc.lastAutoTable.finalY + 10;
        const subtotal = order.totalAmount / 1.18;
        const tax = order.totalAmount - subtotal;

        doc.setFontSize(10);
        doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)}`, 140, finalY);
        doc.text(`Tax (GST 18%): Rs. ${tax.toFixed(2)}`, 140, finalY + 5);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`Total Paid: Rs. ${order.totalAmount.toFixed(2)}`, 140, finalY + 15);

        // Save
        doc.save(`Invoice_${order._id.slice(-8)}.pdf`);
    };

    const { darkMode } = useTheme();

    return (
        <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-start mb-8">
                    <Link
                        to="/"
                        className={`flex items-center space-x-2 transition-colors font-medium px-4 py-2 rounded-lg border ${darkMode ? 'text-brand-400 hover:text-brand-300 bg-brand-900/10 border-brand-800' : 'text-brand-600 hover:text-brand-700 bg-brand-50 border-brand-100'}`}
                    >
                        <Home className="h-5 w-5" />
                        <span>Back to Home</span>
                    </Link>
                </div>

                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <CheckCircle className="h-20 w-20 text-green-500 animate-bounce" />
                    </div>
                    <h1 className={`text-4xl font-extrabold tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Order Confirmed!</h1>
                    <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Thank you for your purchase. We've received your order and are preparing it for shipment.
                    </p>
                </div>

                {order ? (
                    <div className={`shadow-xl rounded-2xl overflow-hidden border transition-colors duration-200 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <div className="bg-brand-600 px-8 py-4 flex justify-between items-center text-white">
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Order Receipt</span>
                                <span className="text-brand-100 font-mono text-xs opacity-70">#{order._id?.toUpperCase()}</span>
                            </div>
                            <button
                                onClick={downloadInvoice}
                                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors border border-white/30"
                            >
                                <Download className="h-4 w-4" />
                                <span>Download PDF</span>
                            </button>
                        </div>

                        <div className="p-8">
                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Order Date</p>
                                            <p className={`font-medium transition-colors ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <Package className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Shipping Address</p>
                                            <p className={`font-medium transition-colors ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{order.shippingAddress?.street}, {order.shippingAddress?.city}</p>
                                            <p className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{order.shippingAddress?.state}, {order.shippingAddress?.zip}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <CreditCard className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Payment Method</p>
                                            <p className={`font-medium transition-colors flex items-center ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                                <span>{order.paymentMethod === 'Stripe' ? 'Online Payment' : order.paymentMethod}</span>
                                                {order.paymentSubMethod && (
                                                    <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border transition-colors ${darkMode ? 'bg-blue-900/30 text-blue-400 border-blue-800' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                        {order.paymentSubMethod}
                                                    </span>
                                                )}
                                            </p>
                                            <p className={`text-xs font-bold inline-block px-2 py-0.5 rounded mt-1 border transition-colors ${(order.paymentMethod !== 'COD' || order.status === 'Delivered') ? `${darkMode ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-green-100 text-green-700 border-green-200'}` : `${darkMode ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-red-100 text-red-700 border-red-200'}`}`}>
                                                PAID: {(order.paymentMethod !== 'COD' || order.status === 'Delivered') ? 'YES' : 'NO'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>Items Ordered</h3>
                                <div className="space-y-4">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-10 h-10 rounded flex items-center justify-center transition-colors ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                    {item.image || item.product?.images?.[0] ? (
                                                        <img src={item.image || item.product?.images?.[0]} alt={item.name || item.product?.name} className="w-full h-full object-cover rounded" />
                                                    ) : (
                                                        <Package className="h-5 w-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`font-medium transition-colors ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{item.name || item.product?.name || 'Product Removed'}</p>
                                                    <p className={`text-xs transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <span className={`font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className={`border-t pt-6 space-y-2 transition-colors ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                <div className="flex justify-between text-sm">
                                    <span className={`transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Subtotal</span>
                                    <span className={`font-medium transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹{(order.totalAmount / 1.18).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className={`transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tax (GST 18%)</span>
                                    <span className={`font-medium transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹{(order.totalAmount - (order.totalAmount / 1.18)).toFixed(2)}</span>
                                </div>
                                <div className={`flex justify-between text-xl font-extrabold pt-4 border-t transition-colors ${darkMode ? 'border-gray-700 text-white' : 'border-gray-100 text-gray-900'}`}>
                                    <span>Total Paid</span>
                                    <span className={darkMode ? 'text-brand-400' : 'text-brand-600'}>₹{order.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={`text-center p-12 rounded-2xl shadow-sm border border-dashed transition-colors ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}>
                        <p className={`transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Order details are available in your profile history.</p>
                    </div>
                )}

                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/profile"
                        className={`px-10 py-4 rounded-xl font-bold transition transform hover:-translate-y-1 shadow-lg flex items-center justify-center ${darkMode ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-900/20' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-200'}`}
                    >
                        View My Orders
                    </Link>
                    <Link
                        to="/shop"
                        className={`px-10 py-4 rounded-xl font-bold border-2 transition transform hover:-translate-y-1 shadow-md flex items-center justify-center ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 shadow-none' : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50 shadow-sm'}`}
                    >
                        Keep Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Success;
