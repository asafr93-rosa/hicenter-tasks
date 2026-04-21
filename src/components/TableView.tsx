import { useState } from 'react';
import type { Task, TaskStatus } from '../types/index';
import { formatDate, isOverdue } from '../utils/date';

interface TableViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

type SortKey = 'title' | 'status' | 'startDate' | 'dueDate';

const STATUS_ORDER: Record<TaskStatus, number> = { 'set': 0, 'in-progress': 1, 'done': 2 };
const STATUS_STYLE: Record<TaskStatus, { bg: string; color: string; label: string }> = {
  'set': { bg: '#F3F4F6', color: '#6B7280', label: 'Set' },
  'in-progress': { bg: '#FEF3C7', color: '#D97706', label: 'In Progress' },
  'done': { bg: '#D1FAE5', color: '#059669', label: 'Done' },
};
const STATUS_SEQUENCE: TaskStatus[] = ['set', 'in-progress', 'done'];

export function TableView({ tasks, onEditTask, onStatusChange }: TableViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('dueDate');
  const [sortAsc, setSortAsc] = useState(true);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
  }

  const sorted = [...tasks].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'title') cmp = a.title.localeCompare(b.title);
    else if (sortKey === 'status') cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    else if (sortKey === 'startDate') cmp = (a.startDate ?? '').localeCompare(b.startDate ?? '');
    else if (sortKey === 'dueDate') {
      if (!a.dueDate) cmp = 1;
      else if (!b.dueDate) cmp = -1;
      else cmp = a.dueDate.localeCompare(b.dueDate);
    }
    return sortAsc ? cmp : -cmp;
  });

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span style={{ color: '#D1D5DB' }}> ↕</span>;
    return <span style={{ color: '#00B5AD' }}>{sortAsc ? ' ↑' : ' ↓'}</span>;
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ color: '#9CA3AF' }}>
        <p className="text-sm">No tasks yet. Add one!</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl" style={{ border: '1px solid #E5E7EB', background: '#fff' }}>
      <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
            {([
              { key: 'title', label: 'Title' },
              { key: 'status', label: 'Status' },
              { key: 'startDate', label: 'Start' },
              { key: 'dueDate', label: 'Due' },
            ] as { key: SortKey; label: string }[]).map(col => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                className="text-left px-4 py-3 text-xs font-semibold cursor-pointer select-none"
                style={{ color: '#6B7280', whiteSpace: 'nowrap' }}
              >
                {col.label}<SortIcon k={col.key} />
              </th>
            ))}
            <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#6B7280' }}>
              Description
            </th>
            <th className="px-4 py-3 text-xs font-semibold" style={{ color: '#6B7280' }} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((task, i) => {
            const overdue = isOverdue(task.dueDate, task.status);
            const st = STATUS_STYLE[task.status];
            const idx = STATUS_SEQUENCE.indexOf(task.status);

            return (
              <tr
                key={task.id}
                style={{ borderBottom: i < sorted.length - 1 ? '1px solid #F3F4F6' : 'none' }}
              >
                <td className="px-4 py-3 font-medium" style={{ color: '#1A2B4A', minWidth: '140px', maxWidth: '220px' }}>
                  <div className="flex items-center gap-1.5">
                    {overdue && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#DC2626' }} />}
                    <span className="truncate">{task.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      const next = STATUS_SEQUENCE[(idx + 1) % STATUS_SEQUENCE.length];
                      onStatusChange(task.id, next);
                    }}
                    title="Click to advance status"
                    className="px-2 py-1 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap"
                    style={{ background: st.bg, color: st.color, border: 'none' }}
                  >
                    {st.label}
                  </button>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                  {task.startDate ? formatDate(task.startDate) : '—'}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: overdue ? '#DC2626' : '#9CA3AF', fontWeight: overdue ? 600 : 400 }}>
                  {task.dueDate ? formatDate(task.dueDate) : '—'}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: '#9CA3AF', maxWidth: '200px' }}>
                  <span className="truncate block">{task.description || '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onEditTask(task)}
                    className="px-3 py-1 rounded-lg text-xs font-medium cursor-pointer"
                    style={{ background: '#F3F4F6', color: '#6B7280', border: 'none', whiteSpace: 'nowrap' }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
