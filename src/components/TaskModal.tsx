import { useState, useEffect } from 'react';
import type { Task, TaskFormData, TaskStatus, TaskPriority } from '../types/index';
import { today } from '../utils/date';
import { useTaskStore } from '../store/taskStore';

interface TaskModalProps {
  task?: Task | null;
  defaultStatus?: TaskStatus;
  onSave: (data: TaskFormData) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'set', label: 'Set' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export function TaskModal({ task, defaultStatus = 'set', onSave, onDelete, onClose }: TaskModalProps) {
  const { tasks } = useTaskStore();
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');
  const [category, setCategory] = useState(task?.category ?? '');
  const [startDate, setStartDate] = useState(task?.startDate ?? today());
  const [dueDate, setDueDate] = useState(task?.dueDate ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const existingCategories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean))) as string[];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), status, priority, category: category.trim() || undefined, startDate, dueDate });
    onClose();
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1.5px solid #E5E7EB',
    color: '#1A2B4A',
    background: '#FAFAFA',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,43,74,0.4)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: '1px solid #F0F0F0' }}>
          <h2 className="text-base font-semibold" style={{ color: '#1A2B4A' }}>
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer"
            style={{ color: '#9CA3AF', background: 'none', border: 'none', fontSize: '20px' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 flex flex-col gap-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
              Title <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title"
              required
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#00B5AD')}
              onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add details…"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={e => (e.target.style.borderColor = '#00B5AD')}
              onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Category</label>
            <input
              type="text"
              list="category-suggestions"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. Marketing, Dev, Design…"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = '#00B5AD')}
              onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
            />
            {existingCategories.length > 0 && (
              <datalist id="category-suggestions">
                {existingCategories.map(c => <option key={c} value={c} />)}
              </datalist>
            )}
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => (e.target.style.borderColor = '#00B5AD')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Priority</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={e => (e.target.style.borderColor = '#00B5AD')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              >
                {PRIORITY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                inputMode="decimal"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#00B5AD')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#6B7280' }}>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                inputMode="decimal"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = '#00B5AD')}
                onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 pb-1">
            {task && onDelete && (
              confirmDelete ? (
                <div className="flex gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => { onDelete(); onClose(); }}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold cursor-pointer"
                    style={{ background: '#DC2626', color: '#fff', border: 'none' }}
                  >
                    Confirm Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="py-2.5 px-4 rounded-lg text-sm cursor-pointer"
                    style={{ background: '#F3F4F6', color: '#6B7280', border: 'none' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="py-2.5 px-4 rounded-lg text-sm font-medium cursor-pointer"
                  style={{ background: '#FEF2F2', color: '#DC2626', border: 'none' }}
                >
                  Delete
                </button>
              )
            )}
            {!confirmDelete && (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-lg text-sm cursor-pointer"
                  style={{ background: '#F3F4F6', color: '#6B7280', border: 'none', marginLeft: task ? 'auto' : '0', flex: task ? '0' : '1' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-lg text-sm font-semibold text-white cursor-pointer"
                  style={{ background: '#00B5AD', border: 'none', flex: task ? '0' : '1' }}
                >
                  {task ? 'Save' : 'Add Task'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
