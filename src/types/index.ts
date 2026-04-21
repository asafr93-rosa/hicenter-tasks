export interface User {
  username: string;
  passwordHash: string;
}

export type TaskStatus = 'set' | 'in-progress' | 'done';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  createdAt: string;
}

export type ViewMode = 'kanban' | 'list' | 'table';

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
}
