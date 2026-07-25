export function LogoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 50" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left teal circle */}
      <circle cx="26" cy="25" r="22" fill="#1ad1b9" />
      {/* Middle yellow circle */}
      <circle cx="48" cy="25" r="22" fill="#f5b72b" />
      {/* Right coral pink circle */}
      <circle cx="70" cy="25" r="22" fill="#ff5c7c" />
      {/* Center play triangle */}
      <polygon points="43,16 59,25 43,34" fill="#080d08" />
    </svg>
  );
}

export default LogoIcon;
