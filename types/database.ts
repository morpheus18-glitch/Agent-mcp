// Todo types
export interface Todo {
  id: number
  title: string
  description?: string | null
  status: string
  priority: string
  due_date?: string | null
  user_id?: number
  created_at: string
  updated_at: string
}

// User types
export interface User {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  name: string
  description: string | null
  category: string
  content: unknown
  tags: string[]
  created_by: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface File {
  id: string
  name: string
  type: string
  size: number
  url: string
  created_at: string
}
