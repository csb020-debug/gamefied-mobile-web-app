export interface AssignmentConfig {
  points: number;
  instructions: string;
  difficulty: string;
  category: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  type: string;
  config: AssignmentConfig;
  class_id: string;
  due_at: string;
  created_at: string;
  updated_at: string;
}

export interface TeacherInvitation {
  id: string;
  teacher_email: string;
  school_id: string;
  invited_by: string;
  invitation_token: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  nickname: string;
  class_id: string;
  created_at: string;
  updated_at: string;
  classes?: any;
  submissions?: { score: number; completed: boolean }[];
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  teacher_id: string;
  school_id?: string;
  class_code: string;
  created_at: string;
  updated_at: string;
  students: Student[];
  teachers?: any;
}

export interface RpcResult {
  success: boolean;
  error?: string;
  invitation_token?: string;
  expires_at?: string;
  school_name?: string;
}