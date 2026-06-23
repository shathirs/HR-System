export interface Position {
  id: string;
  department_id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePositionPayload {
  department_id: string;
  title: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdatePositionPayload {
  department_id?: string;
  title?: string;
  description?: string;
  is_active?: boolean;
}
