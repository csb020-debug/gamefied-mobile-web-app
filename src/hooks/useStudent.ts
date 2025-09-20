import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  class_id: string;
  nickname: string;
  created_at: string;
}

interface Class {
  id: string;
  name: string;
  grade: string;
  class_code: string;
}

export const useStudent = () => {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for student data in localStorage
    const studentData = localStorage.getItem('eco_quest_student');
    if (studentData) {
      const student = JSON.parse(studentData);
      setCurrentStudent(student);
      
      // Fetch class data
      if (student.class_id) {
        fetchClassData(student.class_id);
      }
    }
    setLoading(false);
  }, []);

  const fetchClassData = async (classId: string) => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (error) throw error;
      setCurrentClass(data);
    } catch (error) {
      console.error('Error fetching class data:', error);
    }
  };

  const joinClass = async (classCode: string, nickname: string) => {
    try {
      // First, find the class by code
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('class_code', classCode.toUpperCase())
        .single();

      if (classError || !classData) {
        return { error: 'Class not found. Please check the class code.' };
      }

      // Check if nickname is already taken in this class
      const { data: existingStudent, error: checkError } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classData.id)
        .eq('nickname', nickname)
        .maybeSingle();

      if (checkError) {
        return { error: 'Error checking nickname availability.' };
      }

      if (existingStudent) {
        return { error: 'This nickname is already taken in this class.' };
      }

      // Create new student
      const { data: newStudent, error: insertError } = await supabase
        .from('students')
        .insert({
          class_id: classData.id,
          nickname: nickname
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Store student data in localStorage
      localStorage.setItem('eco_quest_student', JSON.stringify(newStudent));
      setCurrentStudent(newStudent);
      setCurrentClass(classData);

      return { student: newStudent, class: classData };
    } catch (error: any) {
      return { error: error.message || 'Failed to join class.' };
    }
  };

  const leaveClass = () => {
    localStorage.removeItem('eco_quest_student');
    setCurrentStudent(null);
    setCurrentClass(null);
  };

  return {
    currentStudent,
    currentClass,
    loading,
    joinClass,
    leaveClass
  };
};