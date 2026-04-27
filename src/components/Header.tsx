import { useAuthStore } from '../store/authStore';
import { Logo } from './Logo';
import type { ViewMode } from '../types/index';

interface HeaderProps {
  viewMode: ViewMode;
  onViewChange: (v: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const VIEWS: { value: ViewMode; label: string }[] = [
  { value: 'kanban', label: 'Kanban' },
  { value: 'list', label: 'List' },
  { value: 'table', label: 'Table' },
];

export function Header({ viewMode, onViewChange, searchQuery, onSearchChange }: HeaderProps) {
  const { currentUser, logout } = useAuthStore();

  return (
    <header
      className="flex items-center justify-between gap-3 px-4 md:px-6 h-14 shrink-0"
      style={{ background: '#F0F4F9', borderBottom: '1px solid #E5E7EB' }}
    >
      {/* Logo */}
      <Logo size="sm" />

      {/* Search */}
      <div className="flex-1 max-w-xs relative">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          width="14" height="14" viewBox="0 0 16 16" fill="none"
        >
          <circle cx="6.5" cy="6.5" r="5" stroke="#9CA3AF" strokeWidth="1.5" />
          <path d="M10.5 10.5L14 14" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search tasks…"
          className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none"
          style={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            color: '#1A2B4A',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ color: '#9CA3AF', background: 'none', border: 'none', lineHeight: 1 }}
          >
            ✕
          </button>
        )}
      </div>

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
