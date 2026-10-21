import { useState } from 'react';
import { X, Check, AlertCircle, Package } from 'lucide-react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import Button from './ui/Button';
import { useTheme } from '../context/ThemeContext';

const ReturnRequestModal = ({ order, onClose, onSuccess }) => {
    const { addToast } = useToast();
    const [selectedItems, setSelectedItems] = useState([]);
    const [reason, setReason] = useState('');
    const [type, setType] = useState('Refund'); // 'Refund' or 'Exchange'
    const [submitting, setSubmitting] = useState(false);
    const { darkMode } = useTheme();

    // Filter out items that are not eligible (though logic usually allows all for now)
    const availableItems = order.items;

    const handleItemToggle = (item) => {
        // Use item._id (order item ID) as the unique key because it always exists
        const uniqueId = item._id || item.productId || (item.product?._id) || item.product;

        if (!uniqueId) return;

        const isSelected = selectedItems.find(i => i.uniqueId === uniqueId);

        if (isSelected) {
            setSelectedItems(selectedItems.filter(i => i.uniqueId !== uniqueId));
        } else {
            setSelectedItems([...selectedItems, {
                uniqueId: uniqueId,
                product: item.product?._id || item.product || null, // Allow null product
                productId: item.productId || null,
                name: item.name || item.product?.name || 'Product Unavailable',
                image: item.image || item.product?.images?.[0] || null,
                quantity: item.quantity
            }]);
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedItems.length === 0) {
            addToast('Please select at least one item', 'error');
            return;
        }
        if (!reason.trim()) {
            addToast('Please provide a reason', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                orderId: order._id,
                items: selectedItems,
                type,
                reason
            };

            const res = await api.post('/returns', payload);
            addToast('Return request submitted successfully', 'success');
            onSuccess(res.data);
            onClose();
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to submit return request', 'error');
            console.error(err);
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10001] p-4 animate-in fade-in duration-300">
            <div className={`rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col transition-colors ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <div className={`p-6 border-b flex justify-between items-center transition-colors ${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                    <h3 className={`text-xl font-bold transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Request Return or Exchange</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Items Selection */}
                    <section>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Select Items</h4>
                        <div className="space-y-3">
                            {availableItems.map((item, idx) => {
                                const uniqueId = item._id || item.productId || (item.product?._id) || item.product;
                                const isSelected = selectedItems.find(i => i.uniqueId === uniqueId);
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleItemToggle(item)}
                                        className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10 dark:border-brand-500' : `${darkMode ? 'border-gray-800 hover:border-brand-900' : 'border-gray-200 hover:border-brand-300'}`}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-4 transition-colors ${isSelected ? 'bg-brand-600 border-brand-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {isSelected && <Check className="h-3 w-3 text-white" />}
                                        </div>
                                        <div className="h-12 w-12 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {(item.product?.images?.[0] || item.image) ? (
                                                <img src={item.product?.images?.[0] || item.image} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <Package className="h-5 w-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <p className={`font-bold transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.name || item.product?.name || 'Product Unavailable'}</p>
                                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Qty: {item.quantity} • ₹{item.price}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Type Selection */}
                    <section>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Resolution Type</h4>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => setType('Refund')}
                                className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm transition-all ${type === 'Refund' ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/30' : `${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}`}
                            >
                                Refund to Original Payment
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('Exchange')}
                                className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm transition-all ${type === 'Exchange' ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/30' : `${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}`}
                            >
                                Replace / Exchange Item
                            </button>
                        </div>
                    </section>

                    {/* Reason */}
                    <section>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Reason for Return</h4>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Please explain why you want to return this item. e.g. Damaged, Wrong size, Not as described."
                            className="w-full h-32 px-4 py-3 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all resize-none"
                        ></textarea>
                    </section>

                </div>

                <div className={`p-6 border-t flex justify-end space-x-4 transition-colors ${darkMode ? 'bg-gray-950 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} isLoading={submitting} disabled={selectedItems.length === 0 || !reason}>
                        Submit Request
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReturnRequestModal;
