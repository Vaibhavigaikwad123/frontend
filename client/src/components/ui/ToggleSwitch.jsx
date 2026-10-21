const ToggleSwitch = ({ checked, onChange, className = '' }) => {
    return (
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${checked ? 'bg-brand-600' : 'bg-gray-200'
                } ${className}`}
            role="switch"
            aria-checked={checked}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );
};

export default ToggleSwitch;
