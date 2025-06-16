// Todo types
export interface Todo {
  id: number;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  due_date?: string | null;
  user_id?: number;
  created_at: string;
  updated_at: string;
}

// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}
