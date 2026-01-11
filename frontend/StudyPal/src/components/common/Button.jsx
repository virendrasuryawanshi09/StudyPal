import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'md',
}) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl ' +
    'transition-all duration-200 active:scale-[0.97] ' +
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ' +
    'whitespace-nowrap';

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-slate-700 to-slate-600 text-white ' +
      'hover:from-slate-600 hover:to-slate-700 ' +
      'dark:from-indigo-600 dark:to-indigo-500 ' +
      'dark:hover:from-indigo-500 dark:hover:to-indigo-600 ' +
      'shadow-md hover:shadow-lg',

    secondary:
      'bg-slate-200 text-slate-800 hover:bg-slate-300 ' +
      'dark:bg-[#232734] dark:text-slate-200 dark:hover:bg-[#2b3040]',

    outline:
      'border border-slate-300 text-slate-700 hover:bg-slate-100 ' +
      'dark:border-slate-600 dark:text-slate-200 dark:hover:bg-[#232734]',
  };

  const sizeStyles = {
    sm: 'h-9 px-4 text-xs',
    md: 'h-11 px-5 text-sm',
    lg: 'h-12 px-6 text-sm',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
};

export default Button;
