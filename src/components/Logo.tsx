import logoSrc from '../assets/logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const HEIGHT: Record<string, number> = { sm: 32, md: 40, lg: 56 };

export function Logo({ size = 'md' }: LogoProps) {
  const h = HEIGHT[size];
  return (
    <img
      src={logoSrc}
      alt="HiCenter"
      height={h}
      style={{ height: h, width: 'auto', display: 'block', objectFit: 'contain' }}
    />
  );
}
