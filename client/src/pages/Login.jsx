import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loginError, setLoginError] = useState('');
    const { login, loginWithGoogle, isAuthenticating, isAuthenticated, user } = useAuth();
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { addToast } = useToast();

    // Get the path to redirect to, default to home
    const from = location.state?.from?.pathname || "/";
    const fromProtectedRoute = location.state?.from !== undefined;

    // Redirect if already authenticated (handles Google Login popup success)
    useEffect(() => {
        if (isAuthenticated && user) {
            // Role-based redirection
            if (user.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate, from]);

    // Check for OAuth errors
    useEffect(() => {
        const error = searchParams.get('error');
        if (error === 'google_auth_failed') {
            setLoginError('Google authentication failed. Please try again.');
        } else if (error === 'authentication_failed') {
            setLoginError('Authentication failed. Please try again.');
        }
    }, [searchParams]);

    const validateForm = () => {
        const newErrors = {};

        if (!email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');

        if (!validateForm()) {
            return;
        }

        try {
            const userData = await login(email, password);
            addToast('Logged in successfully!', 'success');

            // Role-based redirection
            if (userData?.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        } catch (err) {
            setLoginError(err.message || 'Failed to login. Please check credentials.');
        }
    };

    const handleGoogleLogin = () => {
        loginWithGoogle();
    };

    return (
        <div className={`min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${darkMode ? 'bg-gray-950' : 'bg-white'}`}>
            <div className={`max-w-md w-full space-y-8 p-10 rounded-2xl shadow-xl border transition-colors ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
                {/* Header */}
                <div className="text-center">
                    <h2 className={`text-4xl font-bold transition-colors ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Welcome Back
                    </h2>
                    <p className={`mt-2 text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Sign in to your account to continue
                    </p>

                    {/* Backend Error Message */}
                    {loginError && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 shadow-sm animate-shake">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800 text-left font-medium">
                                {loginError}
                            </p>
                        </div>
                    )}

                    {/* Protected Route Message */}
                    {fromProtectedRoute && !loginError && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-800 text-left">
                                Please log in to continue your purchase
                            </p>
                        </div>
                    )}
                </div>

                {/* Google Login Button */}
                <div>
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isAuthenticating}
                        className={`w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group ${darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className={`text-sm font-medium transition-colors ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Continue with Google
                        </span>
                    </button>
                </div>

                {/* Divider Removed */}

                {/* Login Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className={`block text-sm font-medium mb-1 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setErrors({ ...errors, email: '' });
                                    setLoginError('');
                                }}
                                className={`appearance-none relative block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.email
                                    ? (darkMode ? 'border-red-900' : 'border-red-300')
                                    : (darkMode ? 'border-gray-700' : 'border-gray-300')
                                    } ${darkMode ? 'bg-gray-800 text-gray-100 placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-500'
                                    }`}
                                placeholder="Enter your email"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className={`block text-sm font-medium mb-1 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setErrors({ ...errors, password: '' });
                                        setLoginError('');
                                    }}
                                    className={`appearance-none relative block w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.password
                                        ? (darkMode ? 'border-red-900' : 'border-red-300')
                                        : (darkMode ? 'border-gray-700' : 'border-gray-300')
                                        } ${darkMode ? 'bg-gray-800 text-gray-100 placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-500'
                                        }`}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>
                        <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <Link to="/forgot-password" className={`font-medium transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={isAuthenticating}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                        >
                            {isAuthenticating ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>
                </form>

                {/* Register Link */}
                <div className="text-center">
                    <p className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className={`font-medium transition-colors duration-200 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                        >
                            Create one now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

