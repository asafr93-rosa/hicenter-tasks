export interface User {
  username: string;
  passwordHash: string;
}

export type TaskStatus = string;
export type TaskPriority = 'low' | 'medium' | 'high';

export interface StatusConfig {
  id: string;
  label: string;
  color: string;
  order: number;
}

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
  parentId?: string;
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
  parentId?: string;
}
