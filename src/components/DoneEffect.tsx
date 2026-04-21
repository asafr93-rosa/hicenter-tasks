import { useEffect } from 'react';

interface DoneEffectProps {
  onComplete: () => void;
}

const COLORS = ['#00B5AD', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', '#84CC16'];
const PARTICLE_COUNT = 18;

const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * 360;
  const rad = (angle * Math.PI) / 180;
  const dist = 55 + (i % 3) * 18;
  return {
    id: i,
    color: COLORS[i % COLORS.length],
    tx: Math.cos(rad) * dist,
    ty: Math.sin(rad) * dist,
    size: 6 + (i % 4) * 2,
    isSquare: i % 3 === 0,
    delay: (i % 4) * 30,
  };
});

export function DoneEffect({ onComplete }: DoneEffectProps) {
  useEffect(() => {
    const t = setTimeout(onComplete, 1500);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {/* Checkmark badge */}
      <div style={{
        width: 70,
        height: 70,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #10B981, #059669)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 34,
        color: '#fff',
        boxShadow: '0 0 0 0 rgba(16,185,129,0.5)',
        animation: 'done-badge-pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        position: 'relative',
        zIndex: 2,
      }}>
        ✓
      </div>

      {/* Confetti particles */}
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: p.isSquare ? '2px' : '50%',
            background: p.color,
            animationDelay: `${p.delay}ms`,
            animationDuration: '1.2s',
            animationTimingFunction: 'ease-out',
            animationFillMode: 'forwards',
            animationName: 'done-particle',
            '--ptx': `${p.tx}px`,
            '--pty': `${p.ty}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
