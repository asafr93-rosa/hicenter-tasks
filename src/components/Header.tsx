import { useAuthStore } from '../store/authStore';
import { Logo } from './Logo';
import type { ViewMode } from '../types/index';

interface HeaderProps {
  viewMode: ViewMode;
  onViewChange: (v: ViewMode) => void;
}

const VIEWS: { value: ViewMode; label: string }[] = [
  { value: 'kanban', label: 'Kanban' },
  { value: 'list', label: 'List' },
  { value: 'table', label: 'Table' },
];

export function Header({ viewMode, onViewChange }: HeaderProps) {
  const { currentUser, logout } = useAuthStore();

  return (
    <header
      className="flex items-center justify-between px-4 md:px-6 h-14 shrink-0"
      style={{ background: '#F0F4F9', borderBottom: '1px solid #E5E7EB' }}
    >
      {/* Logo */}
      <Logo size="sm" />

      {/* View toggle */}
      <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
        {VIEWS.map(v => (
          <button
            key={v.value}
            onClick={() => onViewChange(v.value)}
            className="px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer"
            style={{
              background: viewMode === v.value ? '#00B5AD' : '#F0F4F9',
              color: viewMode === v.value ? '#fff' : '#6B7280',
              border: 'none',
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* User */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium hidden sm:block" style={{ color: '#6B7280' }}>
          {currentUser}
        </span>
        <button
          onClick={logout}
          className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
          style={{ background: '#E2E8F0', color: '#6B7280', border: 'none' }}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
