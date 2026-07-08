import React from 'react';

const Button = ({ children, isLoading, className = '', variant = 'primary', ...props }) => {
  const baseStyle =
    "inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm " +
    "transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variants = {
    primary:
      "bg-blue-600 text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/40 focus-visible:ring-blue-500",
    secondary:
      "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-slate-300",
    outline:
      "border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-slate-300",
    ghost:
      "text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300",
    danger:
      "bg-red-600 text-white shadow-sm shadow-red-600/30 hover:bg-red-700 focus-visible:ring-red-500",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
