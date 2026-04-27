export interface User {
  username: string;
  passwordHash: string;
}

export type TaskStatus = 'set' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  startDate: string;
  dueDate: string;
  createdAt: string;
}

export type ViewMode = 'kanban' | 'list' | 'table';

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  startDate: string;
  dueDate: string;
}
