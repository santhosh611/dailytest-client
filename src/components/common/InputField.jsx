// frontend/src/components/common/InputField.jsx
import React, { useState } from 'react';

function InputField({ label, id, type, value, onChange, placeholder, required, className, isPassword }) {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    id={id}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 ${className}`}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    >
                        {showPassword ? (
                            // Eye slash icon (hide password)
                            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.418 0-8-3.582-8-8a9.965 9.965 0 011.603-5.625m4.293-1.077A9.954 9.954 0 0112 3c4.418 0 8 3.582 8 8a9.965 9.965 0 01-1.603 5.625m-4.293 1.077a9.954 9.954 0 01-5.625 1.603m5.625-1.603a10.05 10.05 0 01-1.603-5.625m-4.293 1.077a9.954 9.954 0 015.625-1.603m-5.625 1.603a10.05 10.05 0 01-5.625 1.603M4 11h16" />
                            </svg>
                        ) : (
                            // Eye icon (show password)
                            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

export default InputField;