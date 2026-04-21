import type { Task, TaskStatus } from '../types/index';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAddTask: (status: TaskStatus) => void;
}

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'set', label: 'Set', color: '#6B7280' },
  { status: 'in-progress', label: 'In Progress', color: '#D97706' },
  { status: 'done', label: 'Done', color: '#059669' },
];

export function KanbanBoard({ tasks, onEditTask, onStatusChange, onAddTask }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 h-full">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.status);
        return (
          <div
            key={col.status}
            className="flex flex-col rounded-xl flex-1 min-w-[240px]"
            style={{ background: '#ECEEF1', minHeight: 0 }}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                <span className="text-sm font-semibold" style={{ color: '#1A2B4A' }}>{col.label}</span>
              </div>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: '#fff', color: '#6B7280' }}
              >
                {colTasks.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-2">
              {colTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => onEditTask(task)}
                  onStatusChange={status => onStatusChange(task.id, status)}
                />
              ))}

              {/* Add button */}
              <button
                onClick={() => onAddTask(col.status)}
                className="w-full py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors mt-1"
                style={{
                  background: 'none',
                  border: '1.5px dashed #C4C9D4',
                  color: '#9CA3AF',
                }}
              >
                + Add task
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
