import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { Header } from '../components/Header';
import { TaskModal } from '../components/TaskModal';
import { KanbanBoard } from '../components/KanbanBoard';
import { ListView } from '../components/ListView';
import { TableView } from '../components/TableView';
import type { Task, TaskStatus, TaskPriority, ViewMode, TaskFormData } from '../types/index';

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

const selectStyle: React.CSSProperties = {
  padding: '4px 8px',
  borderRadius: '6px',
  border: '1px solid #C4C9D4',
  fontSize: '12px',
  color: '#1A2B4A',
  background: '#fff',
  cursor: 'pointer',
  outline: 'none',
};

export function Board() {
  const { currentUser } = useAuthStore();
  const { tasks, addTask, updateTask, deleteTask, bulkUpdateTasks } = useTaskStore();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [editingTask, setEditingTask] = useState<Task | null | undefined>(undefined);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('set');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const userTasks = tasks.filter(t => t.userId === currentUser);

  function openNew(status: TaskStatus = 'set') {
    setDefaultStatus(status);
    setEditingTask(null);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
  }

  function closeModal() {
    setEditingTask(undefined);
  }

  function handleSave(data: TaskFormData) {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask({ ...data, userId: currentUser ?? '' });
    }
  }

  function handleDelete() {
    if (editingTask) {
      deleteTask(editingTask.id);
      setSelectedIds(prev => { const next = new Set(prev); next.delete(editingTask.id); return next; });
    }
  }

  function handleStatusChange(id: string, status: TaskStatus) {
    updateTask(id, { status });
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAll(ids: string[]) {
    setSelectedIds(new Set(ids));
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function bulkUpdate(updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>) {
    bulkUpdateTasks(Array.from(selectedIds), updates);
  }

  const isModalOpen = editingTask !== undefined;
  const selCount = selectedIds.size;

  return (
    <div className="flex flex-col h-screen" style={{ background: '#F4F7FA' }}>
      <Header viewMode={viewMode} onViewChange={setViewMode} />

      <div className="flex-1 overflow-hidden p-4 md:p-5 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-base font-semibold" style={{ color: '#1A2B4A' }}>
              {currentUser ? `${currentUser}'s Board` : 'My Board'}
            </h1>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>
              {userTasks.length} task{userTasks.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => openNew()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer"
            style={{ background: '#00B5AD', border: 'none' }}
          >
            <span>+</span>
            <span>New Task</span>
          </button>
        </div>

        {/* Bulk edit bar */}
        {selCount > 0 && (
          <div
            className="flex items-center gap-2 flex-wrap mb-3 px-3 py-2 rounded-xl"
            style={{ background: '#E0F7F5', border: '1px solid #00B5AD' }}
          >
            <button
              onClick={clearSelection}
              className="text-xs font-bold cursor-pointer w-5 h-5 flex items-center justify-center rounded-full"
              style={{ background: '#00B5AD', color: '#fff', border: 'none', flexShrink: 0 }}
              title="Clear selection"
            >
              ✕
            </button>
            <span className="text-xs font-semibold" style={{ color: '#00B5AD' }}>
              {selCount} selected
            </span>
            <span style={{ color: '#A7D9D7', fontSize: '12px' }}>|</span>
            <select
              value=""
              onChange={e => { if (e.target.value) bulkUpdate({ status: e.target.value as TaskStatus }); }}
              style={selectStyle}
            >
              <option value="">Status…</option>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              value=""
              onChange={e => { if (e.target.value) bulkUpdate({ priority: e.target.value as TaskPriority }); }}
              style={selectStyle}
            >
              <option value="">Priority…</option>
              {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: '#6B7280' }}>Start:</span>
              <input
                type="date"
                onChange={e => { if (e.target.value) bulkUpdate({ startDate: e.target.value }); }}
                style={{ ...selectStyle, color: '#6B7280' }}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs" style={{ color: '#6B7280' }}>Due:</span>
              <input
                type="date"
                onChange={e => { if (e.target.value) bulkUpdate({ dueDate: e.target.value }); }}
                style={{ ...selectStyle, color: '#6B7280' }}
              />
            </div>
          </div>
        )}

        {/* View content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'kanban' && (
            <div className="h-full overflow-x-auto">
              <div className="h-full min-w-[720px] flex flex-col">
                <KanbanBoard
                  tasks={userTasks}
                  onEditTask={openEdit}
                  onStatusChange={handleStatusChange}
                  onAddTask={openNew}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                />
              </div>
            </div>
          )}
          {viewMode === 'list' && (
            <div className="h-full overflow-y-auto">
              <ListView
                tasks={userTasks}
                onEditTask={openEdit}
                onStatusChange={handleStatusChange}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onSelectAll={selectAll}
              />
            </div>
          )}
          {viewMode === 'table' && (
            <div className="h-full overflow-y-auto">
              <TableView
                tasks={userTasks}
                onEditTask={openEdit}
                onStatusChange={handleStatusChange}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onSelectAll={selectAll}
              />
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <TaskModal
          task={editingTask ?? null}
          defaultStatus={defaultStatus}
          onSave={handleSave}
          onDelete={editingTask ? handleDelete : undefined}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
