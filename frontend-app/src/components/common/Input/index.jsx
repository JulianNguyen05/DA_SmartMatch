import React from 'react';

const Input = React.forwardRef(function Input(
  { label, type = "text", name, value, onChange, placeholder, required = false, hint, className = '', ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="mb-1.5 flex items-baseline justify-between">
          <span className="text-sm font-medium text-slate-700">
            {label} {required && <span className="text-red-500">*</span>}
          </span>
          {hint && <span className="text-xs font-medium text-slate-400">{hint}</span>}
        </label>
      )}
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className={
          "block w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50/60 " +
          "text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all duration-150 " +
          "focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 " +
          className
        }
        {...props}
      />
    </div>
  );
});

export default Input;
