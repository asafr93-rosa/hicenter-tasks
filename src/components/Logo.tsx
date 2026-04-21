interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ size = 'md' }: LogoProps) {
  const scale = size === 'sm' ? 0.7 : size === 'lg' ? 1.4 : 1;
  const w = Math.round(195 * scale);
  const h = Math.round(40 * scale);

  return (
    <svg width={w} height={h} viewBox="0 0 195 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* "Hi" in teal */}
      <text x="0" y="31" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="30" fill="#00B5AD">Hi</text>
      {/* Target icon */}
      <circle cx="66" cy="20" r="13" stroke="#00B5AD" strokeWidth="2" fill="none" />
      <circle cx="66" cy="20" r="7" stroke="#1A2B4A" strokeWidth="2" fill="none" />
      <circle cx="66" cy="20" r="2.5" fill="#00B5AD" />
      <line x1="66" y1="7" x2="66" y2="33" stroke="#00B5AD" strokeWidth="1.5" />
      <line x1="53" y1="20" x2="79" y2="20" stroke="#00B5AD" strokeWidth="1.5" />
      {/* "Center" in navy */}
      <text x="84" y="31" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="30" fill="#1A2B4A">Center</text>
    </svg>
  );
}
