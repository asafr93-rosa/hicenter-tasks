import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task, TaskStatus, TaskPriority } from '../types/index';
import { formatDate, isOverdue } from '../utils/date';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onStatusChange: (status: TaskStatus) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

const STATUS_SEQUENCE: TaskStatus[] = ['set', 'in-progress', 'done'];

const STATUS_STYLE: Record<TaskStatus, { bg: string; color: string; label: string }> = {
  'set':         { bg: '#F3F4F6', color: '#6B7280', label: 'Set' },
  'in-progress': { bg: '#FEF3C7', color: '#D97706', label: 'In Progress' },
  'done':        { bg: '#D1FAE5', color: '#059669', label: 'Done' },
};

const PRIORITY_STYLE: Record<TaskPriority, { bg: string; color: string; label: string }> = {
  'high':   { bg: '#FEE2E2', color: '#DC2626', label: 'High' },
  'medium': { bg: '#FEF3C7', color: '#D97706', label: 'Med' },
  'low':    { bg: '#F3F4F6', color: '#9CA3AF', label: 'Low' },
};

export function TaskCard({ task, onClick, onStatusChange, isSelected, onToggleSelect }: TaskCardProps) {
  const overdue = isOverdue(task.dueDate, task.status);
  const currentIndex = STATUS_SEQUENCE.indexOf(task.status);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < STATUS_SEQUENCE.length - 1;
  const st = STATUS_STYLE[task.status];
  const priority = task.priority ?? 'medium';
  const pt = PRIORITY_STYLE[priority];

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

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
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className="bg-white rounded-xl p-3"
      style={{
        border: isSelected ? '2px solid #00B5AD' : '1px solid #E5E7EB',
        boxShadow: isDragging
          ? '0 12px 28px rgba(0,0,0,0.18)'
          : '0 1px 3px rgba(0,0,0,0.06)',
        opacity: isDragging ? 0.45 : 1,
        transform: CSS.Translate.toString(transform),
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'box-shadow 0.15s',
        zIndex: isDragging ? 50 : undefined,
        position: 'relative',
        touchAction: 'none',
      }}
    >
      {/* Checkbox + Title + overdue dot */}
      <div className="flex items-start gap-2 mb-2">
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={isSelected ?? false}
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
            onChange={e => { e.stopPropagation(); onToggleSelect(task.id); }}
            className="mt-0.5 shrink-0 cursor-pointer"
            style={{ accentColor: '#00B5AD', width: '14px', height: '14px' }}
          />
        )}
        {overdue && (
          <span className="mt-1 shrink-0 w-2 h-2 rounded-full" style={{ background: '#DC2626' }} title="Overdue" />
        )}
        <p className="text-sm font-semibold leading-snug flex-1" style={{ color: '#1A2B4A' }}>
          {task.title}
        </p>
        <span
          className="text-xs font-medium px-1.5 py-0.5 rounded shrink-0"
          style={{ background: pt.bg, color: pt.color, fontSize: '10px' }}
        >
          {pt.label}
        </span>
      </div>

      {task.description && (
        <p className="text-xs mb-2 line-clamp-2" style={{ color: '#9CA3AF' }}>
          {task.description}
        </p>
      )}

      {task.category && (
        <span className="inline-block text-xs mb-2 px-1.5 py-0 rounded" style={{ background: '#EEF2FF', color: '#6366F1', fontSize: '10px' }}>
          {task.category}
        </span>
      )}

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
            className="w-6 h-6 rounded flex items-center justify-center text-xs cursor-pointer"
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
            className="w-6 h-6 rounded flex items-center justify-center text-xs cursor-pointer"
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
