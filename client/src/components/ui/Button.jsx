import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../context/ThemeContext';

const Button = ({ children, variant = 'primary', className, isLoading, loading, ...props }) => {
    const { darkMode } = useTheme();
    const isActuallyLoading = isLoading || loading;
    const baseStyles = "inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200";

    const variants = {
        primary: "border-transparent text-white bg-brand-600 hover:bg-brand-700 focus:ring-brand-500",
        secondary: darkMode
            ? "border-gray-700 text-gray-200 bg-gray-800 hover:bg-gray-700 focus:ring-brand-500"
            : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-brand-500",
        danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
        outline: darkMode
            ? "border-brand-600 text-brand-400 bg-transparent hover:bg-brand-900/20 focus:ring-brand-500"
            : "border-brand-600 text-brand-600 bg-transparent hover:bg-brand-50 focus:ring-brand-500"
    };

    return (
        <button
            {...props}
            className={twMerge(baseStyles, variants[variant], className)}
            disabled={isActuallyLoading || props.disabled}
        >
            {isActuallyLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                </>
            ) : children}
        </button>
    );
};

export default Button;
