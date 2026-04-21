import type { Task, TaskStatus } from '../types/index';
import { formatDate, isOverdue } from '../utils/date';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onStatusChange: (status: TaskStatus) => void;
}

const STATUS_SEQUENCE: TaskStatus[] = ['set', 'in-progress', 'done'];

const STATUS_STYLE: Record<TaskStatus, { bg: string; color: string; label: string }> = {
  'set': { bg: '#F3F4F6', color: '#6B7280', label: 'Set' },
  'in-progress': { bg: '#FEF3C7', color: '#D97706', label: 'In Progress' },
  'done': { bg: '#D1FAE5', color: '#059669', label: 'Done' },
};

export function TaskCard({ task, onClick, onStatusChange }: TaskCardProps) {
  const overdue = isOverdue(task.dueDate, task.status);
  const currentIndex = STATUS_SEQUENCE.indexOf(task.status);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < STATUS_SEQUENCE.length - 1;
  const st = STATUS_STYLE[task.status];

  function movePrev(e: React.MouseEvent) {
    e.stopPropagation();
    if (canGoBack) onStatusChange(STATUS_SEQUENCE[currentIndex - 1]);
  }

  function moveNext(e: React.MouseEvent) {
    e.stopPropagation();
    if (canGoForward) onStatusChange(STATUS_SEQUENCE[currentIndex + 1]);
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-3 cursor-pointer"
      style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      {/* Title + overdue dot */}
      <div className="flex items-start gap-2 mb-2">
        {overdue && (
          <span className="mt-1 shrink-0 w-2 h-2 rounded-full" style={{ background: '#DC2626' }} title="Overdue" />
        )}
        <p className="text-sm font-semibold leading-snug flex-1" style={{ color: '#1A2B4A' }}>
          {task.title}
        </p>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs mb-2 line-clamp-2" style={{ color: '#9CA3AF' }}>
          {task.description}
        </p>
      )}

      {/* Dates */}
      {(task.startDate || task.dueDate) && (
        <p className="text-xs mb-2" style={{ color: '#9CA3AF' }}>
          {task.startDate && formatDate(task.startDate)}
          {task.startDate && task.dueDate && ' → '}
          {task.dueDate && (
            <span style={{ color: overdue ? '#DC2626' : '#9CA3AF', fontWeight: overdue ? 600 : 400 }}>
              {formatDate(task.dueDate)}
            </span>
          )}
        </p>
      )}

      {/* Status badge + move buttons */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: st.bg, color: st.color }}
        >
          {st.label}
        </span>
        <div className="flex gap-1">
          <button
            onClick={movePrev}
            disabled={!canGoBack}
            title="Move back"
            className="w-6 h-6 rounded flex items-center justify-center text-xs cursor-pointer transition-opacity"
            style={{
              background: '#F3F4F6',
              color: canGoBack ? '#6B7280' : '#D1D5DB',
              border: 'none',
              opacity: canGoBack ? 1 : 0.4,
            }}
          >
            ←
          </button>
          <button
            onClick={moveNext}
            disabled={!canGoForward}
            title="Move forward"
            className="w-6 h-6 rounded flex items-center justify-center text-xs cursor-pointer transition-opacity"
            style={{
              background: '#F3F4F6',
              color: canGoForward ? '#6B7280' : '#D1D5DB',
              border: 'none',
              opacity: canGoForward ? 1 : 0.4,
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
