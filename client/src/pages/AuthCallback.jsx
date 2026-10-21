import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token && window.opener) {
            // Send token to parent window
            window.opener.postMessage(
                { type: 'GOOGLE_AUTH_SUCCESS', token },
                '*'
            );

            // Close popup
            window.close();
        } else if (token) {
            // Direct navigation (not popup) - redirect to home
            navigate('/');
        } else {
            // No token - redirect to login with error
            navigate('/login?error=authentication_failed');
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Completing authentication...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
