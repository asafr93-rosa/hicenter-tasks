import type { Task, TaskStatus } from '../types/index';
import { formatDate, isOverdue } from '../utils/date';

interface ListViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

const STATUS_SEQUENCE: TaskStatus[] = ['set', 'in-progress', 'done'];

const STATUS_STYLE: Record<TaskStatus, { bg: string; color: string; label: string }> = {
  'set': { bg: '#F3F4F6', color: '#6B7280', label: 'Set' },
  'in-progress': { bg: '#FEF3C7', color: '#D97706', label: 'In Progress' },
  'done': { bg: '#D1FAE5', color: '#059669', label: 'Done' },
};

export function ListView({ tasks, onEditTask, onStatusChange }: ListViewProps) {
  const sorted = [...tasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ color: '#9CA3AF' }}>
        <p className="text-sm">No tasks yet. Add one!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-w-2xl mx-auto w-full">
      {sorted.map(task => {
        const overdue = isOverdue(task.dueDate, task.status);
        const st = STATUS_STYLE[task.status];
        const idx = STATUS_SEQUENCE.indexOf(task.status);

        return (
          <div
            key={task.id}
            className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer"
            style={{ border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
            onClick={() => onEditTask(task)}
          >
            {/* Overdue dot */}
            {overdue && (
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#DC2626' }} title="Overdue" />
            )}

            {/* Title + description */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: '#1A2B4A' }}>{task.title}</p>
              {task.description && (
                <p className="text-xs truncate mt-0.5" style={{ color: '#9CA3AF' }}>{task.description}</p>
              )}
            </div>

            {/* Due date */}
            <span className="text-xs shrink-0 hidden sm:block" style={{ color: overdue ? '#DC2626' : '#9CA3AF', fontWeight: overdue ? 600 : 400 }}>
              {task.dueDate ? formatDate(task.dueDate) : '—'}
            </span>

            {/* Status badge (click to cycle) */}
            <button
              onClick={e => {
                e.stopPropagation();
                const next = STATUS_SEQUENCE[(idx + 1) % STATUS_SEQUENCE.length];
                onStatusChange(task.id, next);
              }}
              title="Click to advance status"
              className="px-2 py-1 rounded-full text-xs font-medium cursor-pointer shrink-0"
              style={{ background: st.bg, color: st.color, border: 'none' }}
            >
              {st.label}
            </button>
          </div>
        );
      })}
    </div>
  );
}
