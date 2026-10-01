export default function Logo({ size = 32, color = '#7A2E4A' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 4h6l-1 9a3 3 0 0 1-4 0z" />
      <path d="M11 16v10" />
      <path d="M8 27h6" />
      <path d="M24 4h-6l1 9a3 3 0 0 0 4 0z" />
      <path d="M21 16v10" />
      <path d="M18 27h6" />
      <path d="M16 2v3" />
      <path d="M13 3l1 2" />
      <path d="M19 3l-1 2" />
    </svg>
  );
}
