import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getImageUrl } from '../utils/imageHelper';
import { formatPrice } from '../utils/formatPrice';
import { useTheme } from '../context/ThemeContext';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder_key_here');

const MockStripeForm = ({ onSuccess, totalAmount, userEmail, darkMode }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: userEmail || '',
        cardNumber: '',
        cardExpiry: '',
        cardCVC: '',
        cardName: '',
        country: 'India'
    });

    useEffect(() => {
        if (userEmail) {
            setFormData(prev => ({ ...prev, email: userEmail }));
        }
    }, [userEmail]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network delay
        setTimeout(() => {
            onSuccess({ id: 'mock_pi_' + Date.now() });
        }, 1500);
    };

    return (
        <div className={`mt-6 border rounded-lg p-6 shadow-sm max-w-lg mx-auto transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
            <h3 className={`text-xl font-medium mb-6 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Pay with card</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-gray-700 bg-white"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Card information</label>
                    <div className="border rounded overflow-hidden bg-white">
                        <input
                            type="text"
                            name="cardNumber"
                            placeholder="1234 1234 1234 1234"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border-b outline-none text-gray-700 bg-white"
                        />
                        <div className="flex">
                            <input
                                type="text"
                                name="cardExpiry"
                                placeholder="MM / YY"
                                value={formData.cardExpiry}
                                onChange={handleChange}
                                required
                                className="w-1/2 px-3 py-2 border-r outline-none text-gray-700 bg-white"
                            />
                            <input
                                type="text"
                                name="cardCVC"
                                placeholder="CVC"
                                value={formData.cardCVC}
                                onChange={handleChange}
                                required
                                className="w-1/2 px-3 py-2 outline-none text-gray-700 bg-white"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cardholder name</label>
                    <input
                        type="text"
                        name="cardName"
                        placeholder="Full name on card"
                        value={formData.cardName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-gray-700 bg-white"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Country or region</label>
                    <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-gray-700 bg-white"
                    >
                        <option>India</option>
                        <option>United States</option>
                        <option>United Kingdom</option>
                    </select>
                </div>

                <div className="flex items-center space-x-2 py-2">
                    <input type="checkbox" id="save-info-mock" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                    <label htmlFor="save-info-mock" className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Securely save my information for 1-click checkout
                        <p className={`text-xs transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Pay faster on this site and everywhere Link is accepted.</p>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#0070f3] text-white py-3 rounded-md hover:bg-blue-700 font-semibold transition disabled:opacity-50 mt-4 text-lg"
                >
                    {isLoading ? "Processing..." : `Pay ${formatPrice(totalAmount)}`}
                </button>
            </form>

            <div className="mt-4 flex items-center justify-center space-x-2 opacity-50">
                <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Test Mode Enabled</span>
            </div>
        </div>
    );
};

const StripePaymentForm = ({ onSuccess, totalAmount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setIsLoading(true);
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/checkout/success',
            },
            redirect: "if_required",
        });

        if (error) {
            setMessage(error.message);
            setIsLoading(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            onSuccess(paymentIntent);
        } else {
            setMessage("Payment processing...");
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <PaymentElement />
            {message && <div className="text-red-500 mt-2 text-sm">{message}</div>}
            <button
                type="submit"
                disabled={isLoading || !stripe || !elements}
                className="w-full mt-6 bg-brand-600 text-white py-3 rounded-md hover:bg-brand-700 font-semibold transition disabled:opacity-50"
            >
                {isLoading ? "Processing..." : `Pay ${formatPrice(totalAmount)}`}
            </button>
        </form>
    );
};

const MockRazorpayModal = ({ isOpen, onClose, amount, onSuccess, customerName, customerEmail, darkMode }) => {
    const [step, setStep] = useState('list'); // 'list', 'details', 'otp'
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [cardData, setCardData] = useState({
        number: '',
        expiry: '',
        cvv: '',
        holder: customerName || ''
    });
    const [otpValue, setOtpValue] = useState('');
    const [otpError, setOtpError] = useState('');
    const [generatedOTP, setGeneratedOTP] = useState('');

    if (!isOpen) return null;

    const paymentOptions = [
        { id: 'upi', name: 'UPI', icon: '📱', description: 'Google Pay, PhonePe, Paytm' },
        { id: 'card', name: 'Card', icon: '💳', description: 'Visa, Mastercard, RuPay' },
    ];

    const handleSelect = (method) => {
        setSelectedMethod(method);
        setStep('details');
    };

    const handleBack = () => {
        if (step === 'otp') {
            setStep('details');
        } else {
            setStep('list');
            setSelectedMethod(null);
        }
    };

    const handlePay = () => {
        // For card payments, show OTP step
        if (selectedMethod.id === 'card') {
            // Generate a random 6-digit OTP
            const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOTP(newOTP);
            console.log('🔐 Generated OTP:', newOTP); // Show OTP in console for testing
            setStep('otp');
            setOtpValue('');
            setOtpError('');
            return;
        }

        // For other payment methods (UPI, Netbanking, Wallet), proceed directly
        setIsSimulating(true);
        setTimeout(() => {
            onSuccess(selectedMethod.id);
            setIsSimulating(false);
            setStep('list');
            setSelectedMethod(null);
        }, 1500);
    };

    const handleVerifyOTP = () => {
        // Validate OTP format
        if (!otpValue || otpValue.length !== 6 || !/^\d{6}$/.test(otpValue)) {
            setOtpError('Please enter a valid 6-digit OTP');
            return;
        }

        // Validate OTP matches generated OTP
        if (otpValue !== generatedOTP) {
            setOtpError('Invalid OTP. Please check and try again.');
            return;
        }

        // Clear error and simulate verification
        setOtpError('');
        setIsSimulating(true);

        // Simulation delay
        setTimeout(() => {
            onSuccess(selectedMethod.id);
            setIsSimulating(false);
            setStep('list');
            setSelectedMethod(null);
            setOtpValue('');
        }, 1500);
    };


    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border animate-in zoom-in-95 duration-300 transition-colors ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                {/* Header */}
                <div className="bg-[#0070f3] p-6 text-white text-center relative">
                    {(step === 'details' || step === 'otp') && (
                        <button onClick={handleBack} className="absolute left-4 top-6 hover:bg-white/10 rounded-full p-2 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                    )}
                    <div className="flex justify-between items-start mb-4">
                        <span className={`text-xl font-bold tracking-tight ${(step === 'details' || step === 'otp') ? 'ml-8' : ''}`}>StationaryHub</span>
                        <button onClick={onClose} className="hover:bg-white/10 rounded-full p-1 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="space-y-1">
                        <p className="text-white/80 text-[10px] uppercase tracking-widest font-bold">Checkout Amount</p>
                        <p className="text-3xl font-black">{formatPrice(amount)}</p>
                    </div>
                </div>

                <div className="p-6">
                    {step === 'list' && (
                        <>
                            <h4 className={`text-[10px] font-bold uppercase tracking-widest mb-4 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Select Payment Method</h4>
                            <div className="space-y-3">
                                {paymentOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => handleSelect(opt)}
                                        className={`w-full flex items-center space-x-4 p-4 border rounded-xl transition group text-left ${darkMode ? 'border-gray-800 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        <span className="text-2xl group-hover:scale-110 transition-transform">{opt.icon}</span>
                                        <div className="flex-1">
                                            <p className={`font-bold transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{opt.name}</p>
                                            <p className={`text-[10px] transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{opt.description}</p>
                                        </div>
                                        <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {step === 'details' && (
                        <div className="animate-in slide-in-from-right duration-300">
                            <div className={`flex items-center space-x-3 mb-6 p-3 rounded-xl transition-colors ${darkMode ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                                <span className="text-2xl">{selectedMethod.icon}</span>
                                <div>
                                    <p className={`font-bold transition-colors ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>{selectedMethod.name}</p>
                                    <p className={`text-[10px] transition-colors ${darkMode ? 'text-blue-400/80' : 'text-blue-500/80'}`}>{selectedMethod.description}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                {selectedMethod.id === 'upi' && (
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Enter UPI ID</label>
                                        <input type="text" placeholder="example@upi" className={`w-full px-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${darkMode ? 'border-gray-800 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50 text-gray-900'}`} defaultValue="test@razorpay" />
                                    </div>
                                )}
                                {selectedMethod.id === 'card' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Card Holder Name</label>
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${darkMode ? 'border-gray-800 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50 text-gray-900'}`}
                                                value={cardData.holder}
                                                onChange={(e) => setCardData({ ...cardData, holder: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Card Number</label>
                                            <input
                                                type="text"
                                                placeholder="4242 4242 4242 4242"
                                                className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${darkMode ? 'border-gray-800 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50 text-gray-900'}`}
                                                value={cardData.number}
                                                onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                                                maxLength="19"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Expiry Date</label>
                                                <input
                                                    type="text"
                                                    placeholder="MM / YY"
                                                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${darkMode ? 'border-gray-800 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50 text-gray-900'}`}
                                                    value={cardData.expiry}
                                                    onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                                                    maxLength="5"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">CVV</label>
                                                <input
                                                    type="password"
                                                    placeholder="123"
                                                    className={`w-full px-4 py-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${darkMode ? 'border-gray-800 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50 text-gray-900'}`}
                                                    value={cardData.cvv}
                                                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                                                    maxLength="3"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}


                            </div>

                            <button
                                onClick={handlePay}
                                disabled={isSimulating}
                                className="w-full bg-[#0070f3] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition shadow-lg shadow-blue-500/30 disabled:opacity-70 flex items-center justify-center space-x-2"
                            >
                                {isSimulating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Authorizing...</span>
                                    </>
                                ) : (
                                    <span>Pay Now</span>
                                )}
                            </button>
                        </div>
                    )}

                    {step === 'otp' && (
                        <div className="animate-in slide-in-from-right duration-300">
                            <div className={`flex items-center space-x-3 mb-6 p-3 rounded-xl transition-colors ${darkMode ? 'bg-green-900/20' : 'bg-green-50'}`}>
                                <span className="text-2xl">🔐</span>
                                <div>
                                    <p className={`font-bold transition-colors ${darkMode ? 'text-green-300' : 'text-green-700'}`}>OTP Verification</p>
                                    <p className={`text-[10px] transition-colors ${darkMode ? 'text-green-400/80' : 'text-green-600/80'}`}>Secure your payment</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Enter OTP</label>
                                    <input
                                        type="text"
                                        placeholder="000000"
                                        maxLength="6"
                                        value={otpValue}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            setOtpValue(value);
                                            setOtpError('');
                                        }}
                                        className={`w-full px-4 py-3 border rounded-xl text-center text-2xl font-bold tracking-widest outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${darkMode ? 'border-gray-800 bg-gray-800 text-gray-100' : 'border-gray-200 bg-gray-50 text-gray-900'} ${otpError ? 'border-red-500 ring-2 ring-red-500' : ''}`}
                                    />
                                    {otpError && (
                                        <p className="text-red-500 text-xs mt-2 flex items-center space-x-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <span>{otpError}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Show Generated OTP for Testing */}
                                <div className={`p-3 rounded-lg text-xs transition-colors ${darkMode ? 'bg-yellow-900/20 border border-yellow-800 text-yellow-300' : 'bg-yellow-50 border border-yellow-200 text-yellow-800'}`}>
                                    <p className="flex items-start space-x-2">
                                        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                        <span><strong>TEST MODE:</strong> Your OTP is <span className="font-black text-lg tracking-wider">{generatedOTP}</span></span>
                                    </p>
                                </div>


                            </div>

                            <button
                                onClick={handleVerifyOTP}
                                disabled={isSimulating || otpValue.length !== 6}
                                className="w-full bg-[#0070f3] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                                {isSimulating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <span>Verify OTP</span>
                                )}
                            </button>
                        </div>
                    )}

                    <div className={`mt-8 pt-6 border-t flex items-center justify-between transition-colors ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Customer info</span>
                            <span className={`text-xs font-medium truncate max-w-[140px] transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{customerEmail}</span>
                        </div>
                        <div className="flex items-center space-x-1 opacity-30 grayscale hover:opacity-80 transition cursor-default">
                            <span className="text-[9px] font-black italic text-[#0070f3]">RAZORPAY</span>
                            <span className="text-[9px] font-bold text-gray-500 leading-none">TESTER</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Checkout = () => {
    const { darkMode } = useTheme();
    const { cart, total, clearCart } = useCart();
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'India',
        phone: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('Razorpay');
    const [isProcessing, setIsProcessing] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [showMockRazorpay, setShowMockRazorpay] = useState(false);
    const [mockOrderData, setMockOrderData] = useState(null);

    // Coupon & Gift Wrap State
    const [couponCode, setCouponCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [giftWrap, setGiftWrap] = useState({ enabled: false, message: '' });

    // Calculate Totals
    const subtotal = total;
    const giftWrapCharge = giftWrap.enabled ? 50 : 0;
    const amountAfterDiscount = Math.max(0, subtotal - discountAmount);
    const cgst = parseFloat((amountAfterDiscount * 0.09).toFixed(2));
    const sgst = parseFloat((amountAfterDiscount * 0.09).toFixed(2));
    const grandTotal = parseFloat((amountAfterDiscount + cgst + sgst + giftWrapCharge).toFixed(2));

    const applyCoupon = async (e) => {
        e?.preventDefault();
        try {
            const { data } = await api.post('/coupons/validate', { code: couponCode, orderTotal: subtotal });
            if (data.valid) {
                setDiscountAmount(data.discount);
                setAppliedCoupon(data.coupon);
                addToast(data.message, 'success');
            }
        } catch (err) {
            addToast(err.response?.data?.message || 'Invalid coupon', 'error');
            setDiscountAmount(0);
            setAppliedCoupon(null);
        }
    };

    const removeCoupon = () => {
        setCouponCode('');
        setDiscountAmount(0);
        setAppliedCoupon(null);
        addToast('Coupon removed', 'info');
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Fetch Stripe Client Secret when an online method is selected
    useEffect(() => {
        if (paymentMethod === 'Stripe' && !clientSecret) {
            const fetchClientSecret = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const config = { headers: { 'Authorization': `Bearer ${token}` } };
                    const { data } = await api.post(
                        '/payments/stripe/create-payment-intent',
                        { amount: grandTotal },
                        config
                    );
                    setClientSecret(data.clientSecret);
                } catch (err) {
                    console.error('Error fetching client secret:', err);
                    const errorMessage = err.response?.data?.message || err.message || 'Error initializing payment';
                    addToast(`${errorMessage}. Please try again later.`, 'error');
                }
            };
            fetchClientSecret();
        }
    }, [paymentMethod, grandTotal, clientSecret, addToast]);


    const handleStripeSuccess = async (paymentIntent) => {
        await placeOrder({
            paymentStatus: 'Paid',
            stripePaymentIntentId: paymentIntent.id
        });
    };

    const handleRazorpayPayment = async () => {
        try {
            setIsProcessing(true);
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };

            // 1. Create Order on Backend
            const { data: order } = await api.post(
                '/payments/razorpay/create-order',
                { amount: grandTotal },
                config
            );

            // 1.5 Handle Mock Mode Simulation
            if (order.isMock) {
                console.log('Detected Mock Razorpay Order - Showing simulator modal');
                setMockOrderData(order);
                setShowMockRazorpay(true);
                return;
            }

            // 2. Open Razorpay Checkout (Real mode)
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
                amount: order.amount,
                currency: order.currency,
                name: "StationaryHub",
                description: "Purchase of Stationary Goods",
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment on Backend
                        const verifyRes = await api.post(
                            '/payments/razorpay/verify',
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderData: {
                                    items: cart.map(item => ({
                                        product: item.product._id,
                                        productId: item.product._id,
                                        name: item.product.name,
                                        image: item.product.images?.[0],
                                        quantity: item.quantity,
                                        price: item.product.price
                                    })),
                                    totalAmount: grandTotal,
                                    shippingAddress: formData,
                                    paymentMethod: 'Razorpay',
                                    paymentSubMethod: response.method || 'unknown',
                                    coupon: appliedCoupon ? { code: appliedCoupon.code, discount: discountAmount } : undefined,
                                    giftWrap: {
                                        enabled: giftWrap.enabled,
                                        message: giftWrap.message,
                                        charge: giftWrapCharge
                                    }
                                }
                            },
                            config
                        );

                        if (verifyRes.data.order) {
                            addToast('Payment successful!', 'success');
                            clearCart();
                            navigate('/checkout/success', { state: { order: verifyRes.data.order } });
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
                        addToast('Payment verification failed. Please contact support.', 'error');
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                    contact: formData.phone
                },
                theme: {
                    color: "#0070f3"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                addToast(response.error.description, 'error');
            });
            rzp.open();
        } catch (err) {
            console.error('Razorpay Error:', err);
            addToast('Error initializing Razorpay. Please try again.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleMockRazorpaySuccess = async (method) => {
        setShowMockRazorpay(false);
        setIsProcessing(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };

            const verifyRes = await api.post(
                '/payments/razorpay/verify',
                {
                    razorpay_order_id: mockOrderData.id,
                    razorpay_payment_id: `mock_pay_${method}_${Date.now()}`,
                    razorpay_signature: 'mock_signature',
                    orderData: {
                        items: cart.map(item => ({
                            product: item.product._id,
                            productId: item.product._id,
                            name: item.product.name,
                            image: item.product.images?.[0],
                            quantity: item.quantity,
                            price: item.product.price
                        })),
                        totalAmount: grandTotal,
                        shippingAddress: formData,
                        paymentMethod: 'Razorpay',
                        paymentSubMethod: method,
                        coupon: appliedCoupon ? { code: appliedCoupon.code, discount: discountAmount } : undefined,
                        giftWrap: {
                            enabled: giftWrap.enabled,
                            message: giftWrap.message,
                            charge: giftWrapCharge
                        }
                    }
                },
                config
            );

            if (verifyRes.data.order) {
                addToast(`Payment via ${method.toUpperCase()} successful!`, 'success');
                clearCart();
                navigate('/checkout/success', { state: { order: verifyRes.data.order } });
            }
        } catch (err) {
            console.error('Mock Verification error:', err);
            addToast('Mock Payment verification failed.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCODSubmit = (e) => {
        e.preventDefault();
        placeOrder();
    };

    const placeOrder = async (paymentData = {}) => {
        const orderData = {
            items: cart.map(item => ({
                product: item.product._id,
                productId: item.product._id,
                name: item.product.name,
                image: item.product.images?.[0],
                quantity: item.quantity,
                price: item.product.price
            })),
            totalAmount: grandTotal,
            shippingAddress: formData,
            paymentMethod,
            coupon: appliedCoupon ? { code: appliedCoupon.code, discount: discountAmount } : undefined,
            giftWrap: {
                enabled: giftWrap.enabled,
                message: giftWrap.message,
                charge: giftWrapCharge
            },
            ...paymentData
        };

        try {
            setIsProcessing(true);
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'Authorization': `Bearer ${token}` }
            };

            const { data } = await api.post('/orders', orderData, config);
            addToast('Order placed successfully!', 'success');
            clearCart();
            navigate('/checkout/success', { state: { order: data.order || data } });
        } catch (err) {
            console.error('Order error:', err);
            addToast('Error placing order. Please try again.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) {
        return <div className="p-20 text-center">Please login to checkout.</div>;
    }

    if (cart.length === 0) {
        return <div className="p-20 text-center">Your cart is empty.</div>;
    }

    const appearance = {
        theme: 'stripe',
    };
    const options = {
        clientSecret,
        appearance,
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Shipping & Payment Form */}
                <div className="lg:col-span-2">
                    <div className={`p-6 rounded-lg shadow transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-100 shadow-sm text-gray-900'}`}>
                        <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Shipping Address</h2>

                        {/* Address Form Fields */}
                        <div className="space-y-4 mb-8">
                            <div>
                                <label className={`block text-sm font-medium mb-1 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Street Address</label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    required
                                    className={`w-full px-4 py-2 border rounded-md focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-4 py-2 border rounded-md focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-4 py-2 border rounded-md focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ZIP Code</label>
                                    <input
                                        type="text"
                                        name="zip"
                                        value={formData.zip}
                                        onChange={handleChange}
                                        required
                                        className={`w-full px-4 py-2 border rounded-md focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter 10-digit number"
                                        className={`w-full px-4 py-2 border rounded-md focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-1 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Country</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={formData.country}
                                    readOnly
                                    className={`w-full px-4 py-2 border rounded-md outline-none transition-colors ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div
                                onClick={() => setPaymentMethod('Razorpay')}
                                className={`p-6 border rounded-xl cursor-pointer transition flex flex-col items-center justify-center text-center ${paymentMethod === 'Razorpay' ? 'border-brand-600 bg-brand-50 shadow-md ring-1 ring-brand-600' : `${darkMode ? 'hover:bg-gray-800 border-gray-800' : 'hover:bg-gray-50 border-gray-200'}`
                                    }`}
                            >
                                <div className={`p-2 rounded-full mb-3 ${paymentMethod === 'Razorpay' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <p className={`font-bold transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Razorpay</p>
                                <p className={`text-xs mt-1 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>UPI, Cards, Netbanking</p>
                            </div>
                            <div
                                onClick={() => setPaymentMethod('Stripe')}
                                className={`p-6 border rounded-xl cursor-pointer transition flex flex-col items-center justify-center text-center ${paymentMethod === 'Stripe' ? 'border-brand-600 bg-brand-50 shadow-md ring-1 ring-brand-600' : `${darkMode ? 'hover:bg-gray-800 border-gray-800' : 'hover:bg-gray-50 border-gray-200'}`
                                    }`}
                            >
                                <div className={`p-2 rounded-full mb-3 ${paymentMethod === 'Stripe' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <p className={`font-bold transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Stripe</p>
                                <p className={`text-xs mt-1 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Cards & Apple/Google Pay</p>
                            </div>
                            <div
                                onClick={() => setPaymentMethod('COD')}
                                className={`p-6 border rounded-xl cursor-pointer transition flex flex-col items-center justify-center text-center ${paymentMethod === 'COD' ? 'border-brand-600 bg-brand-50 shadow-md ring-1 ring-brand-600' : `${darkMode ? 'hover:bg-gray-800 border-gray-800' : 'hover:bg-gray-50 border-gray-200'}`
                                    }`}
                            >
                                <div className={`p-2 rounded-full mb-3 ${paymentMethod === 'COD' ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className={`font-bold transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Cash on Delivery</p>
                                <p className={`text-xs mt-1 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pay on receipt</p>
                            </div>
                        </div>

                        {/* Payment Logic Render */}
                        {paymentMethod === 'Razorpay' ? (
                            <button
                                onClick={handleRazorpayPayment}
                                disabled={isProcessing}
                                className="w-full bg-brand-600 text-white py-4 rounded-xl hover:bg-brand-700 font-bold text-lg transition shadow-lg disabled:opacity-50"
                            >
                                {isProcessing ? 'Initializing Razorpay...' : 'Pay with Razorpay'}
                            </button>
                        ) : paymentMethod === 'COD' ? (
                            <button
                                onClick={handleCODSubmit}
                                disabled={isProcessing}
                                className="w-full bg-brand-600 text-white py-4 rounded-xl hover:bg-brand-700 font-bold text-lg transition shadow-lg disabled:opacity-50"
                            >
                                {isProcessing ? 'Processing Order...' : 'Place Order (COD)'}
                            </button>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {clientSecret ? (
                                    clientSecret === 'mock_secret_for_dev_mode' ? (
                                        <MockStripeForm
                                            onSuccess={handleStripeSuccess}
                                            totalAmount={grandTotal}
                                            userEmail={user?.email}
                                            darkMode={darkMode}
                                        />
                                    ) : (
                                        <Elements options={options} stripe={stripePromise}>
                                            <StripePaymentForm onSuccess={handleStripeSuccess} totalAmount={grandTotal} />
                                        </Elements>
                                    )
                                ) : (
                                    <div className={`text-center py-12 flex flex-col items-center rounded-xl border border-dashed transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mb-4"></div>
                                        <p className={`font-medium tracking-wide transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Initializing payment gateway...</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Summary Column */}
                <div className="lg:col-span-1">
                    <div className={`p-6 rounded-lg shadow sticky top-24 transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white border border-gray-100 shadow-sm'}`}>
                        <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Order Summary</h2>
                        <div className="space-y-4">
                            {cart.map(item => (
                                <div key={item.product._id} className={`flex items-center space-x-4 pb-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                    <div className={`w-16 h-16 rounded transition-colors ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        {item.product.images && item.product.images[0] && (
                                            <img src={getImageUrl(item.product.images[0])} alt={item.product.name} className="w-full h-full object-cover rounded" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-medium text-sm transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.product.name}</p>
                                        <p className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatPrice(item.product.price * item.quantity)}</p>
                                    </div>
                                    <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatPrice(item.product.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Gift Wrap & Coupon Section */}
                        <div className={`mt-6 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                            <div className="space-y-4">
                                {/* Gift Wrap */}
                                <div className={`p-4 border rounded-xl transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={giftWrap.enabled}
                                            onChange={(e) => setGiftWrap({ ...giftWrap, enabled: e.target.checked })}
                                            className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                                        />
                                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                                            Add Gift Wrap (+₹50)
                                        </span>
                                    </label>
                                    {giftWrap.enabled && (
                                        <input
                                            type="text"
                                            placeholder="Gift message (optional)"
                                            value={giftWrap.message}
                                            onChange={(e) => setGiftWrap({ ...giftWrap, message: e.target.value })}
                                            className={`mt-3 w-full px-3 py-2 text-sm border rounded outline-none transition-colors ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                        />
                                    )}
                                </div>

                                {/* Coupon */}
                                <div className={`p-4 border rounded-xl transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                                    {appliedCoupon ? (
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-green-500">Coupon Applied!</p>
                                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{appliedCoupon.code}</p>
                                            </div>
                                            <button onClick={removeCoupon} className="text-xs text-red-500 hover:text-red-700 font-bold">Remove</button>
                                        </div>
                                    ) : (
                                        <form onSubmit={applyCoupon} className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter coupon code"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value)}
                                                className={`flex-1 px-3 py-2 text-sm border rounded outline-none uppercase transition-colors ${darkMode ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                                            />
                                            <button
                                                type="submit"
                                                disabled={!couponCode}
                                                className="px-4 py-2 bg-brand-600 text-white text-sm font-bold rounded hover:bg-brand-700 disabled:opacity-50 transition"
                                            >
                                                Apply
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={`mt-6 space-y-2 border-t pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                            <div className="flex justify-between text-sm">
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Subtotal</span>
                                <span className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatPrice(subtotal)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-green-500">
                                    <span>Discount ({appliedCoupon?.code})</span>
                                    <span className="font-medium">- {formatPrice(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>CGST (9%)</span>
                                <span className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatPrice(cgst)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>SGST (9%)</span>
                                <span className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatPrice(sgst)}</span>
                            </div>
                            {giftWrap.enabled && (
                                <div className="flex justify-between text-sm">
                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Gift Wrap</span>
                                    <span className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{formatPrice(50)}</span>
                                </div>
                            )}
                            <div className={`flex justify-between text-sm pt-2 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Total GST (18%)</span>
                                <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{formatPrice(cgst + sgst)}</span>
                            </div>
                            <div className={`flex justify-between text-lg font-bold pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                <span className={darkMode ? 'text-white' : 'text-gray-900'}>Grand Total</span>
                                <span className={darkMode ? 'text-brand-400' : 'text-brand-600'}>{formatPrice(grandTotal)}</span>
                            </div>
                        </div>

                        <div className={`mt-6 p-4 rounded text-xs transition-colors ${darkMode ? 'bg-brand-900/10 text-gray-400' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                            <p className={`font-semibold mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Return & Refund Policy</p>
                            <p>Easy 7-day returns on most products.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mock Razorpay Simulator Modal */}
            <MockRazorpayModal
                isOpen={showMockRazorpay}
                onClose={() => setShowMockRazorpay(false)}
                amount={grandTotal}
                customerName={user?.name}
                customerEmail={user?.email}
                onSuccess={handleMockRazorpaySuccess}
                darkMode={darkMode}
            />
        </div>
    );
};

export default Checkout;
