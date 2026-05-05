import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, StatusConfig } from '../types/index';

export const DEFAULT_STATUSES: StatusConfig[] = [
  { id: 'set',         label: 'Set',         color: '#6B7280', order: 0 },
  { id: 'in-progress', label: 'In Progress',  color: '#D97706', order: 1 },
  { id: 'done',        label: 'Done',         color: '#059669', order: 2 },
];

const STATUS_COLOR_PALETTE = [
  '#6366F1', '#EC4899', '#0EA5E9', '#10B981',
  '#F97316', '#8B5CF6', '#14B8A6', '#EF4444',
];

interface TaskState {
  tasks: Task[];
  statuses: StatusConfig[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  bulkUpdateTasks: (ids: string[], updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>) => void;
  reorderTasks: (orderedIds: string[]) => void;
  addStatus: (label: string) => void;
  reorderStatuses: (sourceId: string, targetId: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      statuses: DEFAULT_STATUSES,

      addTask: (taskData) => {
        set(state => {
          const maxOrder = state.tasks.reduce((m, t) => Math.max(m, t.manualOrder ?? -1), -1);
          const task: Task = {
            ...taskData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            manualOrder: maxOrder + 1,
          };
          return { tasks: [...state.tasks, task] };
        });
      },

      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
        }));
      },

      deleteTask: (id) => {
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== id && t.parentId !== id),
        }));
      },

      bulkUpdateTasks: (ids, updates) => {
        set(state => ({
          tasks: state.tasks.map(t => ids.includes(t.id) ? { ...t, ...updates } : t),
        }));
      },

      reorderTasks: (orderedIds) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            const idx = orderedIds.indexOf(t.id);
            return idx !== -1 ? { ...t, manualOrder: idx } : t;
          }),
        }));
      },

      addStatus: (label) => {
        const trimmed = label.trim();
        if (!trimmed) return;
        set(state => {
          if (state.statuses.find(s => s.label.toLowerCase() === trimmed.toLowerCase())) return state;
          const color = STATUS_COLOR_PALETTE[state.statuses.length % STATUS_COLOR_PALETTE.length];
          const newStatus: StatusConfig = {
            id: crypto.randomUUID(),
            label: trimmed,
            color,
            order: state.statuses.length,
          };
          return { statuses: [...state.statuses, newStatus] };
        });
      },

      reorderStatuses: (sourceId, targetId) => {
        set(state => {
          const sorted = [...state.statuses].sort((a, b) => a.order - b.order);
          const fromIdx = sorted.findIndex(s => s.id === sourceId);
          const toIdx = sorted.findIndex(s => s.id === targetId);
          if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return state;
          const reordered = [...sorted];
          const [moved] = reordered.splice(fromIdx, 1);
          reordered.splice(toIdx, 0, moved);
          return { statuses: reordered.map((s, i) => ({ ...s, order: i })) };
        });
      },
    }),
    {
      name: 'hicenter-tasks',
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!state.statuses || state.statuses.length === 0) {
            state.statuses = DEFAULT_STATUSES;
          }
          // Migrate existing tasks that don't have manualOrder
          let nextOrder = state.tasks.reduce((m, t) => Math.max(m, t.manualOrder ?? -1), -1) + 1;
          state.tasks = state.tasks.map(t =>
            t.manualOrder === undefined ? { ...t, manualOrder: nextOrder++ } : t
          );
        }
      },
    }
  )
);
