import React from 'react';

const Spinner = ({ size = 20, className = '' }) => {
  return (
    <svg
      className={`animate-spin ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M12 2a10 10 0 00-3.16 19.48l1.42-2.47A7 7 0 1119 12h3A10 10 0 0012 2z"
      />
    </svg>
  );
};

export default Spinner;
