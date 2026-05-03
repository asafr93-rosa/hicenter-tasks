import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task, TaskStatus, TaskPriority, StatusConfig } from '../types/index';
import { formatDate, isOverdue } from '../utils/date';

interface TaskCardProps {
  task: Task;
  statuses: StatusConfig[];
  subTasks?: Task[];
  onClick: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onAddSubTask?: (parentId: string) => void;
  onEditSubTask?: (task: Task) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
}

const PRIORITY_STYLE: Record<TaskPriority, { bg: string; color: string; label: string }> = {
  'high':   { bg: '#FEE2E2', color: '#DC2626', label: 'High' },
  'medium': { bg: '#FEF3C7', color: '#D97706', label: 'Med' },
  'low':    { bg: '#F3F4F6', color: '#9CA3AF', label: 'Low' },
};

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function TaskCard({ task, statuses, subTasks = [], onClick, onStatusChange, onAddSubTask, onEditSubTask, isSelected, onToggleSelect }: TaskCardProps) {
  const [subTasksExpanded, setSubTasksExpanded] = useState(false);

  const overdue = isOverdue(task.dueDate, task.status);
  const statusSeq = [...statuses].sort((a, b) => a.order - b.order).map(s => s.id);
  const currentIndex = statusSeq.indexOf(task.status);
  const canGoBack = currentIndex > 0;
  const canGoForward = currentIndex < statusSeq.length - 1;
  const statusConfig = statuses.find(s => s.id === task.status);
  const stColor = statusConfig?.color ?? '#6B7280';
  const stLabel = statusConfig?.label ?? task.status;
  const priority = task.priority ?? 'medium';
  const pt = PRIORITY_STYLE[priority];

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  function movePrev(e: React.MouseEvent) {
    e.stopPropagation();
    if (canGoBack) onStatusChange(statusSeq[currentIndex - 1]);
  }

  function moveNext(e: React.MouseEvent) {
    e.stopPropagation();
    if (canGoForward) onStatusChange(statusSeq[currentIndex + 1]);
  }

  const doneCount = subTasks.filter(st => {
    const sc = statuses.find(s => s.id === st.status);
    return sc?.label.toLowerCase() === 'done' || st.status === 'done';
  }).length;

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
      {/* Checkbox + Title + priority */}
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

      {/* Status badge + move buttons + add sub-task */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: hexToRgba(stColor, 0.12), color: stColor }}
        >
          {stLabel}
        </span>
        <div className="flex gap-1 items-center">
          {onAddSubTask && (
            <button
              onClick={e => { e.stopPropagation(); onAddSubTask(task.id); }}
              title="Add sub-task"
              className="w-6 h-6 rounded flex items-center justify-center text-xs cursor-pointer"
              style={{ background: '#F3F4F6', color: '#6B7280', border: 'none', fontSize: '14px', lineHeight: 1 }}
            >
              ⊕
            </button>
          )}
          <button
            onClick={movePrev}
            disabled={!canGoBack}
            title="Move back"
            className="w-6 h-6 rounded flex items-center justify-center text-xs cursor-pointer"
            style={{ background: '#F3F4F6', color: canGoBack ? '#6B7280' : '#D1D5DB', border: 'none', opacity: canGoBack ? 1 : 0.4 }}
          >
            ←
          </button>
          <button
            onClick={moveNext}
            disabled={!canGoForward}
            title="Move forward"
            className="w-6 h-6 rounded flex items-center justify-center text-xs cursor-pointer"
            style={{ background: '#F3F4F6', color: canGoForward ? '#6B7280' : '#D1D5DB', border: 'none', opacity: canGoForward ? 1 : 0.4 }}
          >
            →
          </button>
        </div>
      </div>

      {/* Sub-tasks toggle */}
      {subTasks.length > 0 && (
        <div className="mt-2" style={{ borderTop: '1px solid #F3F4F6', paddingTop: '8px' }}>
          <button
            onClick={e => { e.stopPropagation(); setSubTasksExpanded(p => !p); }}
            className="flex items-center gap-1.5 w-full cursor-pointer"
            style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
          >
            <span className="text-xs" style={{ color: '#9CA3AF' }}>
              {subTasksExpanded ? '▾' : '▸'}
            </span>
            <span className="text-xs font-medium" style={{ color: '#6B7280' }}>
              Sub-tasks
            </span>
            <span
              className="text-xs px-1.5 py-0 rounded-full ml-auto"
              style={{ background: '#F3F4F6', color: '#9CA3AF', fontSize: '10px' }}
            >
              {doneCount}/{subTasks.length}
            </span>
          </button>

          {subTasksExpanded && (
            <div className="flex flex-col gap-1 mt-2">
              {subTasks.map(st => {
                const sc = statuses.find(s => s.id === st.status);
                const scColor = sc?.color ?? '#6B7280';
                return (
                  <div
                    key={st.id}
                    onClick={e => { e.stopPropagation(); onEditSubTask?.(st); }}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer"
                    style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: scColor }} />
                    <span className="text-xs flex-1 truncate font-medium" style={{ color: '#1A2B4A' }}>{st.title}</span>
                    <span
                      className="text-xs px-1.5 py-0 rounded-full shrink-0"
                      style={{ background: hexToRgba(scColor, 0.12), color: scColor, fontSize: '10px' }}
                    >
                      {sc?.label ?? st.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
