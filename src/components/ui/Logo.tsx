interface LogoProps {
  size?: number;
  className?: string;
  rounded?: string;
}

// Remo logo mark: rounded square, violet→blue gradient, geometric "R" with an AI spark.
export default function Logo({ size = 32, className = '', rounded = 'rounded-xl' }: LogoProps) {
  const gid = 'remo-logo-grad';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${rounded} ${className}`}
      role="img"
      aria-label="Remo"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="0.55" stopColor="#4f46e5" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>

      {/* Background tile */}
      <rect width="48" height="48" rx="12" fill={`url(#${gid})`} />

      {/* Geometric "R" */}
      <path
        d="M16 12h11.2c4.3 0 7.3 2.7 7.3 6.8 0 3.1-1.8 5.4-4.6 6.3l5.1 10.9h-5.6l-4.5-9.9H21v9.9h-5V12zm5 4.4v6.5h5.6c2 0 3.4-1.3 3.4-3.3s-1.4-3.2-3.4-3.2H21z"
        fill="white"
      />

      {/* AI spark */}
      <path
        d="M35.5 11.5l0.9 2.4 2.4 0.9-2.4 0.9-0.9 2.4-0.9-2.4-2.4-0.9 2.4-0.9z"
        fill="white"
        fillOpacity="0.9"
      />
    </svg>
  );
}
