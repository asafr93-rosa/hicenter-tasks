interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ size = 'md' }: LogoProps) {
  const scale = size === 'sm' ? 0.62 : size === 'lg' ? 1.3 : 1;
  const w = Math.round(202 * scale);
  const h = Math.round(38 * scale);

  return (
    <svg width={w} height={h} viewBox="0 0 202 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hi — teal, extrabold */}
      <text
        x="0" y="29"
        fontFamily="'Nunito', 'Poppins', 'Inter', sans-serif"
        fontWeight="800"
        fontSize="28"
        fill="#00AFA8"
        letterSpacing="-0.5"
      >Hi</text>

      {/* Scope / target icon at (62, 19) */}
      {/* Outer ring */}
      <circle cx="63" cy="19" r="13" stroke="#00AFA8" strokeWidth="2" fill="none" />
      {/* Inner dark ring */}
      <circle cx="63" cy="19" r="7" stroke="#1E3347" strokeWidth="2" fill="none" />
      {/* Center dot */}
      <circle cx="63" cy="19" r="2.8" fill="#00AFA8" />
      {/* Full crosshair lines through entire circle */}
      <line x1="63" y1="6"  x2="63" y2="32" stroke="#00AFA8" strokeWidth="1.4" />
      <line x1="50" y1="19" x2="76" y2="19" stroke="#00AFA8" strokeWidth="1.4" />

      {/* Center — dark navy, extrabold */}
      <text
        x="81" y="29"
        fontFamily="'Nunito', 'Poppins', 'Inter', sans-serif"
        fontWeight="800"
        fontSize="28"
        fill="#1E3347"
        letterSpacing="-0.5"
      >Center</text>
    </svg>
  );
}
