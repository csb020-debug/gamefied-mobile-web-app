import { useState, useEffect } from 'react';
import DataService from '@/lib/dataService';
import config from '@/lib/config';

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
      if (!config.isConfigured()) {
        console.error('Supabase not configured');
        return;
      }

      const classData = await DataService.getStudentByClassCode(classId);
      if (classData) {
        setCurrentClass(classData);
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
    }
  };

  const joinClass = async (classCode: string, nickname: string) => {
    try {
      if (!config.isConfigured()) {
        return { error: 'Supabase not configured' };
      }

      // First, find the class by code
      const classData = await DataService.getStudentByClassCode(classCode);
      if (!classData) {
        return { error: 'Class not found. Please check the class code.' };
      }

      // Check if nickname is already taken in this class
      const isAvailable = await DataService.checkNicknameAvailability(classData.id, nickname);
      if (!isAvailable) {
        return { error: 'This nickname is already taken in this class.' };
      }

      // Create new student
      const newStudent = await DataService.createStudent({
        class_id: classData.id,
        nickname: nickname
      });

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