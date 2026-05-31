interface LogoProps {
  className?: string;
  // Tailwind text-size class, e.g. "text-xl". Controls wordmark size.
  size?: string;
}

// Remo wordmark: clean violet→blue gradient text, no icon tile.
export default function Logo({ className = '', size = 'text-xl' }: LogoProps) {
  return (
    <span
      className={`remo-gradient-text font-bold tracking-tight select-none ${size} ${className}`}
    >
      Remo
    </span>
  );
}
