import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task } from '../types/index';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>) => void;
  deleteTask: (id: string) => void;
  bulkUpdateTasks: (ids: string[], updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],

      addTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        set(state => ({ tasks: [...state.tasks, task] }));
      },

      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
        }));
      },

      deleteTask: (id) => {
        set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }));
      },

      bulkUpdateTasks: (ids, updates) => {
        set(state => ({
          tasks: state.tasks.map(t => ids.includes(t.id) ? { ...t, ...updates } : t),
        }));
      },
    }),
    { name: 'hicenter-tasks' }
  )
);
