import React from 'react';

interface HealthcareLogoProps {
  className?: string;
}

export default function HealthcareLogo({ className = "w-6 h-6" }: HealthcareLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Shield */}
      <path d="M12 2L4 6v5c0 5.25 3.75 10.25 8 11 4.25-.75 8-5.75 8-11V6l-8-4z" />
      
      {/* Medical Cross */}
      <path d="M12 7v6M9 10h6" />
      
      {/* Stethoscope */}
      <path d="M7 14c0 1.66 1.34 3 3 3h4c1.66 0 3-1.34 3-3" />
      <circle cx="7" cy="14" r="1.5" />
      <circle cx="17" cy="14" r="1.5" />
    </svg>
  );
}