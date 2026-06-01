'use client';

import React from 'react';

type IconProps = { name: string; className?: string };

const paths: Record<string, React.ReactNode> = {
  cloud: <path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.34 9.5 4 4 0 0 0 7 17.5h10.5Z" />,
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
    </>
  ),
  code: <path d="m8 16-4-4 4-4M16 8l4 4-4 4M14 4l-4 16" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-2 6-4 2 2-6 4-2Z" />
    </>
  ),
  sparkles: <path d="M12 3l1.8 4.6L18 9.4l-4.2 1.8L12 16l-1.8-4.8L6 9.4l4.2-1.8L12 3Z" />,
  rocket: <path d="M5 19c1-3 3-5 6-6m0 0c2-5 6-8 11-8 0 5-3 9-8 11m-3-3 3 3M9 15l-4 4" />,
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-6M22 20H2" />,
};

export function Icon({ name, className = 'w-6 h-6' }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name] ?? paths.sparkles}
    </svg>
  );
}
