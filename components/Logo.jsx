export default function Logo({ showText = true, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 72 72"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="72" height="72" rx="16" fill="#0C1B33" />
        <rect x="13" y="7"  width="10" height="10" fill="white" />
        <rect x="25" y="7"  width="10" height="10" fill="white" />
        <rect x="37" y="7"  width="10" height="10" fill="white" />
        <rect x="13" y="19" width="10" height="10" fill="white" />
        <rect x="49" y="19" width="10" height="10" fill="white" />
        <rect x="13" y="31" width="10" height="10" fill="white" />
        <rect x="25" y="31" width="10" height="10" fill="white" />
        <rect x="37" y="31" width="10" height="10" fill="white" />
        <rect x="13" y="43" width="10" height="10" fill="white" />
        <rect x="13" y="55" width="10" height="10" fill="white" />
        <circle cx="63" cy="9" r="5" fill="#00D4A0" />
      </svg>

      {showText && (
        <span className="leading-none">
          <span className="block text-base font-bold tracking-[0.3em] text-navy-deep dark:text-white">
            PAGIVERSE
          </span>
          <span className="mt-1 block text-[9px] font-light tracking-[0.6em] text-mint">
            STUDIO
          </span>
        </span>
      )}
    </span>
  );
}
