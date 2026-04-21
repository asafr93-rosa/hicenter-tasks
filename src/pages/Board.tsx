import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';
import { Header } from '../components/Header';
import { TaskModal } from '../components/TaskModal';
import { KanbanBoard } from '../components/KanbanBoard';
import { ListView } from '../components/ListView';
import { TableView } from '../components/TableView';
import type { Task, TaskStatus, ViewMode, TaskFormData } from '../types/index';

export function Board() {
  const { currentUser } = useAuthStore();
  const { tasks, addTask, updateTask, deleteTask } = useTaskStore();
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [editingTask, setEditingTask] = useState<Task | null | undefined>(undefined);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('set');

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
    if (editingTask) deleteTask(editingTask.id);
  }

  function handleStatusChange(id: string, status: TaskStatus) {
    updateTask(id, { status });
  }

  const isModalOpen = editingTask !== undefined;

  return (
    <div className="flex flex-col h-screen" style={{ background: '#F4F7FA' }}>
      <Header viewMode={viewMode} onViewChange={setViewMode} />

      {/* Content */}
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

        {/* View content */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'kanban' && (
            <div className="h-full overflow-x-auto">
              <div className="h-full min-w-[720px]">
                <KanbanBoard
                  tasks={userTasks}
                  onEditTask={openEdit}
                  onStatusChange={handleStatusChange}
                  onAddTask={openNew}
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
              />
            </div>
          )}
          {viewMode === 'table' && (
            <div className="h-full overflow-y-auto">
              <TableView
                tasks={userTasks}
                onEditTask={openEdit}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Task modal */}
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
