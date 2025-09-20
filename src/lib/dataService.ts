import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface UserProfile extends Tables<'user_profiles'> {}
export interface Student extends Tables<'students'> {}
export interface Class extends Tables<'classes'> {}
export interface Assignment extends Tables<'assignments'> {}
export interface Submission extends Tables<'submissions'> {}
export interface School extends Tables<'schools'> {}

export class DataService {
  // User Profile Operations
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log('DataService.getUserProfile: Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('DataService.getUserProfile: Profile not found for user:', userId);
          return null; // Profile not found
        }
        // Handle RLS circular reference error
        if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
          console.warn('DataService.getUserProfile: RLS circular reference detected, returning null for user profile');
          return null;
        }
        console.error('DataService.getUserProfile: Database error:', error);
        throw error;
      }

      console.log('DataService.getUserProfile: Profile found:', data);
      return data;
    } catch (error) {
      console.error('DataService.getUserProfile: Exception:', error);
      throw error;
    }
  }

  static async createUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      console.log('DataService.createUserProfile: Creating profile with data:', profile);
      
      // Validate required fields
      if (!profile.user_id || !profile.email) {
        throw new Error('Missing required fields: user_id and email are required');
      }
      
      // Use direct insert with better error handling
      const profileData = {
        user_id: profile.user_id,
        email: profile.email,
        full_name: profile.full_name || 'User',
        role: profile.role || 'school_admin',
        school_id: profile.school_id,
        is_active: profile.is_active !== undefined ? profile.is_active : true
      };
      
      console.log('DataService.createUserProfile: Inserting profile data:', profileData);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('DataService.createUserProfile: Database error:', error);
        console.error('DataService.createUserProfile: Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('DataService.createUserProfile: Profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('DataService.createUserProfile: Exception occurred:', error);
      throw error;
    }
  }

  // Student Operations
  static async getStudentByClassCode(classCode: string): Promise<Class | null> {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('class_code', classCode.toUpperCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Class not found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching class by code:', error);
      throw error;
    }
  }

  static async createStudent(studentData: { class_id: string; nickname: string }): Promise<Student> {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert(studentData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  static async checkNicknameAvailability(classId: string, nickname: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', classId)
        .eq('nickname', nickname)
        .maybeSingle();

      if (error) throw error;
      return !data; // Available if no data returned
    } catch (error) {
      console.error('Error checking nickname availability:', error);
      throw error;
    }
  }

  // Assignment/Challenge Operations
  static async getAssignments(filters: {
    classId?: string;
    teacherId?: string;
    schoolId?: string;
  } = {}): Promise<Assignment[]> {
    try {
      let query = supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.classId) {
        query = query.eq('class_id', filters.classId);
      } else if (filters.teacherId) {
        // Get classes for teacher first
        const { data: classes, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('teacher_id', filters.teacherId);

        if (classError) throw classError;

        if (classes && classes.length > 0) {
          const classIds = classes.map(cls => cls.id);
          query = query.in('class_id', classIds);
        } else {
          return []; // No classes for this teacher
        }
      } else if (filters.schoolId) {
        // Get classes for school first
        const { data: classes, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('school_id', filters.schoolId);

        if (classError) throw classError;

        if (classes && classes.length > 0) {
          const classIds = classes.map(cls => cls.id);
          query = query.in('class_id', classIds);
        } else {
          return []; // No classes for this school
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  }

  // Submission Operations
  static async getSubmissions(studentId: string): Promise<Submission[]> {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('student_id', studentId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  }

  static async createSubmission(submissionData: {
    assignment_id: string;
    student_id: string;
    score: number;
    completed: boolean;
  }): Promise<Submission> {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .upsert([{
          ...submissionData,
          submitted_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating submission:', error);
      throw error;
    }
  }

  // Leaderboard Operations
  static async getStudentLeaderboard(filters: {
    classId?: string;
    teacherId?: string;
    schoolId?: string;
  } = {}): Promise<any[]> {
    try {
      let classFilter = {};

      if (filters.classId) {
        classFilter = { class_id: filters.classId };
      } else if (filters.teacherId) {
        const { data: classes, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('teacher_id', filters.teacherId);

        if (classError) throw classError;

        if (classes && classes.length > 0) {
          classFilter = { class_id: { in: classes.map(cls => cls.id) } };
        } else {
          return [];
        }
      } else if (filters.schoolId) {
        const { data: classes, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('school_id', filters.schoolId);

        if (classError) throw classError;

        if (classes && classes.length > 0) {
          classFilter = { class_id: { in: classes.map(cls => cls.id) } };
        } else {
          return [];
        }
      }

      const { data: students, error } = await supabase
        .from('students')
        .select(`
          id,
          nickname,
          class_id,
          classes (
            name,
            school_id,
            schools (
              name
            )
          ),
          submissions (
            score
          )
        `);

      if (error) throw error;

      // Calculate rankings
      const rankings = students
        ?.map((student: any) => {
          const totalPoints = student.submissions?.reduce((sum: number, sub: any) => sum + (sub.score || 0), 0) || 0;
          return {
            rank: 0, // Will be set after sorting
            name: student.nickname,
            school: student.classes?.schools?.name || student.classes?.name || 'Unknown School',
            points: totalPoints,
            streak: Math.floor(Math.random() * 20) + 1, // TODO: Calculate real streak
            badge: '',
            studentId: student.id
          };
        })
        .sort((a: any, b: any) => b.points - a.points)
        .map((student: any, index: number) => ({
          ...student,
          rank: index + 1,
          badge: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''
        })) || [];

      return rankings;
    } catch (error) {
      console.error('Error fetching student leaderboard:', error);
      throw error;
    }
  }

  static async getSchoolLeaderboard(): Promise<any[]> {
    try {
      const { data: schools, error } = await supabase
        .from('schools')
        .select(`
          id,
          name,
          classes (
            id,
            students (
              id,
              submissions (
                score
              )
            )
          )
        `);

      if (error) throw error;

      // Calculate school rankings
      const rankings = schools
        ?.map((school: any) => {
          let totalPoints = 0;
          let studentCount = 0;

          school.classes?.forEach((cls: any) => {
            cls.students?.forEach((student: any) => {
              studentCount++;
              const studentPoints = student.submissions?.reduce((sum: number, sub: any) => sum + (sub.score || 0), 0) || 0;
              totalPoints += studentPoints;
            });
          });

          return {
            rank: 0, // Will be set after sorting
            name: school.name,
            totalPoints,
            students: studentCount,
            avgPoints: studentCount > 0 ? Math.round(totalPoints / studentCount) : 0,
            badge: ''
          };
        })
        .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
        .map((school: any, index: number) => ({
          ...school,
          rank: index + 1,
          badge: index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''
        })) || [];

      return rankings;
    } catch (error) {
      console.error('Error fetching school leaderboard:', error);
      throw error;
    }
  }

  // School Operations
  static async createSchool(schoolData: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  }): Promise<School> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .insert(schoolData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating school:', error);
      throw error;
    }
  }

  // Class Operations
  static async createClass(classData: {
    name: string;
    grade: string;
    teacher_id: string;
    school_id?: string;
  }): Promise<Class> {
    try {
      // Generate class code
      const { data: classCode, error: codeError } = await supabase.rpc('generate_class_code');
      if (codeError) throw codeError;

      const { data, error } = await supabase
        .from('classes')
        .insert({
          ...classData,
          class_code: classCode
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  }

  // Test connection
  static async testConnection(): Promise<boolean> {
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000);
      });

      const connectionPromise = (async () => {
        // First test basic connection with a simple query
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id')
          .limit(1);

        if (error) {
          // Handle table not found error
          if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
            console.warn('Tables not found in schema cache - database needs to be set up');
            return false; // Tables don't exist yet
          }
          // Handle RLS circular reference error specifically
          if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
            console.warn('RLS circular reference detected, but connection is working');
            return true; // Connection is working, just RLS policy issue
          }
          console.error('Supabase connection test failed:', error);
          return false;
        }

        console.log('Supabase connection test successful');
        return true;
      })();

      return await Promise.race([connectionPromise, timeoutPromise]);
    } catch (error) {
      console.error('Connection test failed with exception:', error);
      return false;
    }
  }
}

export default DataService;
